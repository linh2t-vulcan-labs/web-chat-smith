/**
 * Token Resolver
 *
 * Loads Figma tokens from JSON files, merges them, resolves references,
 * detects cycles, and returns a resolved token map.
 */

import { existsSync, readdirSync } from "node:fs";
import nodePath from "node:path";

import {
  extractRefPath,
  isObjectRecord,
  isTokenValue,
} from "./utils/token-tree";

const { resolve } = nodePath;

export interface TokenValue {
  $value: string | number | Record<string, unknown> | unknown[];
  $type: string;
  $description?: string;
  [key: string]: unknown;
}

export interface TokenMap {
  [key: string]: TokenValue | TokenMap;
}

export interface ResolverResult {
  tokens: TokenMap;
  metadata: {
    version: string;
    fileCount: number;
    totalTokenCount: number;
    resolvedCount: number;
    unresolvedCount: number;
  };
  errors: ResolverError[];
}

export interface ResolverError {
  type:
    | "missing_file"
    | "parse_error"
    | "unresolved_ref"
    | "cycle_detected"
    | "invalid_reference";
  file?: string;
  token?: string;
  ref?: string;
  message: string;
  path?: string[];
}

interface EffectStyleEntry {
  token?: unknown;
  value?: unknown;
  description?: unknown;
  effects?: unknown;
}

export type ColorMode = "dark" | "light";

export class TokenResolver {
  private tokensDir: string;
  private version: string;
  private colorMode: ColorMode;
  private errors: ResolverError[] = [];
  private tokenMap = new Map<string, TokenValue>();
  private resolvedMap = new Map<string, TokenValue>();
  private visiting = new Set<string>();

  constructor(
    tokensDir: string,
    version: string,
    colorMode: ColorMode = "light"
  ) {
    this.tokensDir = tokensDir;
    this.version = version;
    this.colorMode = colorMode;
  }

  async resolve(): Promise<ResolverResult> {
    const versionDir = resolve(this.tokensDir, this.version);

    if (!existsSync(versionDir)) {
      this.errors.push({
        message: `Token version directory not found: ${this.version}`,
        path: [versionDir],
        type: "missing_file",
      });
      return {
        errors: this.errors,
        metadata: {
          fileCount: 0,
          resolvedCount: 0,
          totalTokenCount: 0,
          unresolvedCount: 0,
          version: this.version,
        },
        tokens: {},
      };
    }

    const files = TokenResolver.getTokenFiles(versionDir);
    const rawTokens = await this.loadTokenFiles(versionDir, files);
    const scopedTokens = this.filterByColorMode(rawTokens);
    const mergedTokens = this.mergeTokens(scopedTokens);

    // Resolve per-file refs first, then cross-file refs.
    this.tokenMap = this.resolveLocalFileDependencies(scopedTokens);
    this.resolvedMap.clear();
    this.visiting.clear();

    // Resolve all references
    const resolvedTokens = this.resolveReferencesTree(mergedTokens);

    const totalTokenCount = this.countTokens(mergedTokens);
    const unresolvedCount = this.errors.filter(
      (e) => e.type === "unresolved_ref"
    ).length;

    return this.buildResult(
      resolvedTokens,
      totalTokenCount,
      unresolvedCount,
      files.length
    );
  }

  static getTokenFiles(versionDir: string): string[] {
    return readdirSync(versionDir)
      .filter((file) => file.endsWith(".json"))
      .toSorted();
  }

  private async loadTokenFiles(
    versionDir: string,
    files: string[]
  ): Promise<Record<string, TokenMap>> {
    const result: Record<string, TokenMap> = {};

    const contents = await Promise.all(
      files.map((file) => Bun.file(resolve(versionDir, file)).text())
    );

    for (const [index, file] of files.entries()) {
      try {
        const parsed = JSON.parse(contents[index] ?? "") as unknown;
        result[file] = TokenResolver.normalizeFileData(parsed);
      } catch {
        this.errors.push({
          file,
          message: `Failed to parse ${file}: Parse error`,
          type: "parse_error",
        });
      }
    }

    return result;
  }

  private filterByColorMode(
    fileTokens: Record<string, TokenMap>
  ): Record<string, TokenMap> {
    const excluded =
      this.colorMode === "light"
        ? "alias_colors dark.json"
        : "alias_colors light.json";

    const result: Record<string, TokenMap> = {};
    for (const [file, tree] of Object.entries(fileTokens)) {
      if (file.toLowerCase() === excluded) {
        continue;
      }
      result[file] = tree;
    }

    return result;
  }

  private static normalizeFileData(parsed: unknown): TokenMap {
    if (!isObjectRecord(parsed)) {
      return {};
    }

    const effectStyles = TokenResolver.readEffectStyles(parsed);
    if (!effectStyles) {
      return parsed as TokenMap;
    }

    return TokenResolver.effectStylesToTokenMap(effectStyles);
  }

  private static readEffectStyles(
    parsed: Record<string, unknown>
  ): EffectStyleEntry[] | null {
    const { styles } = parsed;
    if (!isObjectRecord(styles)) {
      return null;
    }

    const { effectStyles } = styles;
    if (!Array.isArray(effectStyles)) {
      return null;
    }

    return effectStyles.filter((entry): entry is EffectStyleEntry =>
      isObjectRecord(entry)
    );
  }

  private static effectStylesToTokenMap(entries: EffectStyleEntry[]): TokenMap {
    const tokens: TokenMap = {};

    for (const entry of entries) {
      const rawToken =
        typeof entry.token === "string" ? entry.token.trim() : "";
      if (!rawToken) {
        continue;
      }

      const path = rawToken.replaceAll("_", "-").split("-");
      if (path.length === 0) {
        continue;
      }

      const normalizedValue = TokenResolver.toShadowTokenValue(entry);
      if (!normalizedValue) {
        continue;
      }

      TokenResolver.setTokenAtPath(tokens, path, {
        $description:
          typeof entry.description === "string" ? entry.description : undefined,
        $type: "shadow",
        $value: normalizedValue,
      });
    }

    return tokens;
  }

  private static toShadowTokenValue(
    entry: EffectStyleEntry
  ): string | Record<string, unknown> | Record<string, unknown>[] | null {
    const layers = TokenResolver.extractDropShadowLayers(entry.effects);
    if (layers.length > 0) {
      return layers;
    }

    if (typeof entry.value !== "string") {
      return null;
    }

    const trimmed = entry.value.trim();
    if (!trimmed) {
      return null;
    }

    return trimmed.replace(/^box-shadow:\s*/iu, "");
  }

  private static extractDropShadowLayers(
    effects: unknown
  ): Record<string, unknown>[] {
    if (!Array.isArray(effects)) {
      return [];
    }

    const layers: Record<string, unknown>[] = [];

    for (const effect of effects) {
      if (!isObjectRecord(effect)) {
        continue;
      }

      if (effect.type !== "drop-shadow") {
        continue;
      }

      layers.push({
        blur: TokenResolver.toCssLength(effect.blur),
        color: effect.color,
        offsetX: TokenResolver.toCssLength(effect.x),
        offsetY: TokenResolver.toCssLength(effect.y),
        spread: TokenResolver.toCssLength(effect.spread),
      });
    }

    return layers;
  }

  private static setTokenAtPath(
    root: TokenMap,
    segments: string[],
    token: TokenValue
  ): void {
    let cursor: TokenMap = root;

    for (const segment of segments.slice(0, -1)) {
      const existing = cursor[segment];

      if (!existing || isTokenValue(existing)) {
        const nested: TokenMap = {};
        cursor[segment] = nested;
        cursor = nested;
        continue;
      }

      cursor = existing as TokenMap;
    }

    const last = segments.at(-1);
    if (!last) {
      return;
    }

    cursor[last] = token;
  }

  private static toCssLength(value: unknown): string {
    return typeof value === "number" ? `${value}px` : "0px";
  }

  private flattenTokens(
    tokens: TokenMap,
    prefix = ""
  ): Map<string, TokenValue> {
    const output = new Map<string, TokenValue>();

    for (const [key, value] of Object.entries(tokens)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;

      if (isTokenValue(value)) {
        output.set(fullPath, value);
        continue;
      }

      if (isObjectRecord(value)) {
        const nested = this.flattenTokens(value as TokenMap, fullPath);
        for (const [path, token] of nested) {
          output.set(path, token);
        }
      }
    }

    return output;
  }

  private collectRefsFromValue(value: TokenValue["$value"]): string[] {
    if (typeof value === "string") {
      const ref = extractRefPath(value);
      return ref ? [ref] : [];
    }

    if (Array.isArray(value)) {
      return value.flatMap((item) =>
        this.collectRefsFromValue(item as TokenValue["$value"])
      );
    }

    if (isObjectRecord(value)) {
      return Object.values(value).flatMap((item) =>
        this.collectRefsFromValue(item as TokenValue["$value"])
      );
    }

    return [];
  }

  private buildFileDependencyGraph(
    fileFlat: Map<string, TokenValue>,
    filePaths: Set<string>
  ): {
    edges: Map<string, Set<string>>;
    inDegree: Map<string, number>;
  } {
    const edges = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    for (const path of filePaths) {
      edges.set(path, new Set());
      inDegree.set(path, 0);
    }

    for (const [path, token] of fileFlat) {
      const refs = this.collectRefsFromValue(token.$value);

      for (const ref of refs) {
        if (!filePaths.has(ref) || ref === path) {
          continue;
        }

        const neighbors = edges.get(ref);
        if (!neighbors || neighbors.has(path)) {
          continue;
        }

        neighbors.add(path);
        inDegree.set(path, (inDegree.get(path) ?? 0) + 1);
      }
    }

    return { edges, inDegree };
  }

  private static getTopologicalOrder(
    edges: Map<string, Set<string>>,
    inDegree: Map<string, number>
  ): string[] {
    const queue: string[] = [];
    for (const [path, degree] of inDegree) {
      if (degree === 0) {
        queue.push(path);
      }
    }
    const order: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        break;
      }

      order.push(current);
      const neighbors = edges.get(current);
      if (!neighbors) {
        continue;
      }

      for (const neighbor of neighbors) {
        const nextDegree = (inDegree.get(neighbor) ?? 0) - 1;
        inDegree.set(neighbor, nextDegree);
        if (nextDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    return order;
  }

  private resolveLocalFileDependencies(
    fileTokens: Record<string, TokenMap>
  ): Map<string, TokenValue> {
    const resolved = new Map<string, TokenValue>();

    for (const [file, tree] of Object.entries(fileTokens)) {
      const fileFlat = this.flattenTokens(tree);
      const filePaths = new Set(fileFlat.keys());
      const { edges, inDegree } = this.buildFileDependencyGraph(
        fileFlat,
        filePaths
      );
      const order = TokenResolver.getTopologicalOrder(edges, inDegree);

      const localResolved = new Map<string, TokenValue>();

      for (const path of order) {
        const token = fileFlat.get(path);
        if (!token) {
          continue;
        }

        localResolved.set(path, {
          ...token,
          $value: this.resolveLocalValue(
            token.$value,
            path,
            filePaths,
            localResolved
          ),
        });
      }

      if (order.length !== fileFlat.size) {
        const cycleNodes: string[] = [];
        for (const [path, degree] of inDegree) {
          if (degree > 0) {
            cycleNodes.push(path);
          }
        }

        if (cycleNodes.length > 0) {
          this.errors.push({
            file,
            message: `Cycle detected in ${file}: ${cycleNodes.join(" → ")}`,
            path: cycleNodes,
            type: "cycle_detected",
          });
        }

        for (const [path, token] of fileFlat) {
          if (!localResolved.has(path)) {
            localResolved.set(path, token);
          }
        }
      }

      for (const [path, token] of localResolved) {
        resolved.set(path, token);
      }
    }

    return resolved;
  }

  private resolveLocalValue(
    value: TokenValue["$value"],
    tokenPath: string,
    filePaths: Set<string>,
    localResolved: Map<string, TokenValue>
  ): TokenValue["$value"] {
    if (typeof value === "string") {
      const refPath = extractRefPath(value);
      if (!refPath || !filePaths.has(refPath)) {
        return value;
      }

      if (refPath === tokenPath) {
        return value;
      }

      const refToken = localResolved.get(refPath);
      return refToken ? refToken.$value : value;
    }

    if (Array.isArray(value)) {
      return value.map((item) =>
        this.resolveLocalValue(
          item as TokenValue["$value"],
          tokenPath,
          filePaths,
          localResolved
        )
      );
    }

    if (isObjectRecord(value)) {
      const resolvedObject: Record<string, unknown> = {};

      for (const [key, nested] of Object.entries(value)) {
        resolvedObject[key] = this.resolveLocalValue(
          nested as TokenValue["$value"],
          tokenPath,
          filePaths,
          localResolved
        );
      }

      return resolvedObject;
    }

    return value;
  }

  private mergeTokens(fileTokens: Record<string, TokenMap>): TokenMap {
    const merged: TokenMap = {};

    for (const [fileName, tokens] of Object.entries(fileTokens)) {
      if (!TokenResolver.shouldIncludeInBaseMerge(fileName)) {
        continue;
      }

      this.deepMerge(merged, tokens);
    }

    return merged;
  }

  private static shouldIncludeInBaseMerge(fileName: string): boolean {
    const lower = fileName.toLowerCase();

    if (
      lower.startsWith("primitive_densitive_mode") &&
      !lower.includes("default")
    ) {
      return false;
    }

    if (
      lower.startsWith("primitive_device_mode") &&
      !lower.includes("desktop")
    ) {
      return false;
    }

    return true;
  }

  private deepMerge(target: TokenMap, source: TokenMap): void {
    for (const [key, value] of Object.entries(source)) {
      if (isTokenValue(value)) {
        target[key] = value;
      } else if (isObjectRecord(value)) {
        if (!target[key]) {
          target[key] = {} as TokenMap;
        }
        if (isObjectRecord(target[key])) {
          this.deepMerge(target[key] as TokenMap, value as TokenMap);
        }
      }
    }
  }

  private resolveReferencesTree(tokens: TokenMap, prefix = ""): TokenMap {
    const result: TokenMap = {};

    for (const [key, value] of Object.entries(tokens)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;

      if (isTokenValue(value)) {
        result[key] = this.resolveTokenByPath(fullPath) ?? value;
      } else if (isObjectRecord(value)) {
        result[key] = this.resolveReferencesTree(value as TokenMap, fullPath);
      }
    }

    return result;
  }

  private resolveTokenByPath(path: string): TokenValue | null {
    const cached = this.resolvedMap.get(path);
    if (cached) {
      return cached;
    }

    const token = this.tokenMap.get(path);
    if (!token) {
      return null;
    }

    if (this.visiting.has(path)) {
      this.errors.push({
        message: `Cycle detected: ${[...this.visiting, path].join(" → ")}`,
        path: [...this.visiting, path],
        token: path,
        type: "cycle_detected",
      });
      return null;
    }

    this.visiting.add(path);
    const resolvedValue = this.resolveValue(token.$value, path);
    this.visiting.delete(path);

    const resolvedToken: TokenValue = {
      ...token,
      $value: resolvedValue,
    };

    this.resolvedMap.set(path, resolvedToken);
    return resolvedToken;
  }

  private resolveValue(
    value: TokenValue["$value"],
    tokenPath: string
  ): TokenValue["$value"] {
    if (typeof value === "string") {
      const refPath = extractRefPath(value);
      if (!refPath) {
        return value;
      }

      if (refPath === tokenPath) {
        this.errors.push({
          message: `Token ${tokenPath} references itself`,
          ref: value,
          token: tokenPath,
          type: "invalid_reference",
        });
        return value;
      }

      const refToken = this.resolveTokenByPath(refPath);
      if (!refToken) {
        this.errors.push({
          message: `Unresolved reference in ${tokenPath}: ${value}`,
          ref: value,
          token: tokenPath,
          type: "unresolved_ref",
        });
        return value;
      }

      return refToken.$value;
    }

    if (Array.isArray(value)) {
      return value.map((item) =>
        this.resolveValue(item as TokenValue["$value"], tokenPath)
      );
    }

    if (isObjectRecord(value)) {
      const resolvedObject: Record<string, unknown> = {};

      for (const [key, nested] of Object.entries(value)) {
        resolvedObject[key] = this.resolveValue(
          nested as TokenValue["$value"],
          tokenPath
        );
      }

      return resolvedObject;
    }

    return value;
  }

  private countTokens(tokens: TokenMap): number {
    let count = 0;

    for (const value of Object.values(tokens)) {
      if (isTokenValue(value)) {
        count += 1;
      } else if (isObjectRecord(value)) {
        count += this.countTokens(value as TokenMap);
      }
    }

    return count;
  }

  private buildResult(
    tokens: TokenMap,
    totalTokenCount: number,
    unresolvedCount = 0,
    fileCount = 0
  ): ResolverResult {
    return {
      errors: this.errors,
      metadata: {
        fileCount,
        resolvedCount: totalTokenCount - unresolvedCount,
        totalTokenCount,
        unresolvedCount,
        version: this.version,
      },
      tokens,
    };
  }
}

// Main entry point
export const resolveTokens = async (
  tokensDir: string,
  version: string,
  colorMode: ColorMode = "light"
): Promise<ResolverResult> => {
  const resolver = new TokenResolver(tokensDir, version, colorMode);
  return await resolver.resolve();
};
