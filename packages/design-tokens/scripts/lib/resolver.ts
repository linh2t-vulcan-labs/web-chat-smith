/**
 * Token Resolver
 *
 * Loads Figma tokens from JSON files, merges them, resolves references,
 * detects cycles, and returns a resolved token map.
 */

import { existsSync, readdirSync } from "node:fs";
import nodePath from "node:path";

import {
  collectFromValue,
  extractRefPath,
  flattenTokenMap,
  isObjectRecord,
  isTokenValue,
  mapTokenTree,
  mapValueLeaves,
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

interface ResolverError {
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

class TokenResolver {
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

  private static toTrimmedTokenName(entry: EffectStyleEntry): string {
    return typeof entry.token === "string" ? entry.token.trim() : "";
  }

  private static toEntryDescription(
    entry: EffectStyleEntry
  ): string | undefined {
    return typeof entry.description === "string"
      ? entry.description
      : undefined;
  }

  private static parseEffectStyleEntry(
    entry: EffectStyleEntry
  ): { path: string[]; token: TokenValue } | null {
    const rawToken = TokenResolver.toTrimmedTokenName(entry);
    if (!rawToken) {
      return null;
    }

    const path = rawToken.replaceAll("_", "-").split("-");
    if (path.length === 0) {
      return null;
    }

    const normalizedValue = TokenResolver.toShadowTokenValue(entry);
    if (!normalizedValue) {
      return null;
    }

    return {
      path,
      token: {
        $description: TokenResolver.toEntryDescription(entry),
        $type: "shadow",
        $value: normalizedValue,
      },
    };
  }

  private static effectStylesToTokenMap(entries: EffectStyleEntry[]): TokenMap {
    const tokens: TokenMap = {};

    for (const entry of entries) {
      const parsed = TokenResolver.parseEffectStyleEntry(entry);
      if (!parsed) {
        continue;
      }

      TokenResolver.setTokenAtPath(tokens, parsed.path, parsed.token);
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

  private static toDropShadowLayer(
    effect: unknown
  ): Record<string, unknown> | null {
    if (!isObjectRecord(effect) || effect.type !== "drop-shadow") {
      return null;
    }

    return {
      blur: TokenResolver.toCssLength(effect.blur),
      color: effect.color,
      offsetX: TokenResolver.toCssLength(effect.x),
      offsetY: TokenResolver.toCssLength(effect.y),
      spread: TokenResolver.toCssLength(effect.spread),
    };
  }

  private static extractDropShadowLayers(
    effects: unknown
  ): Record<string, unknown>[] {
    if (!Array.isArray(effects)) {
      return [];
    }

    const layers: Record<string, unknown>[] = [];

    for (const effect of effects) {
      const layer = TokenResolver.toDropShadowLayer(effect);
      if (layer) {
        layers.push(layer);
      }
    }

    return layers;
  }

  private static ensureNestedTokenMap(
    cursor: TokenMap,
    segment: string
  ): TokenMap {
    const existing = cursor[segment];
    if (existing && !isTokenValue(existing)) {
      return existing as TokenMap;
    }

    const nested: TokenMap = {};
    cursor[segment] = nested;
    return nested;
  }

  private static setTokenAtPath(
    root: TokenMap,
    segments: string[],
    token: TokenValue
  ): void {
    let cursor: TokenMap = root;

    for (const segment of segments.slice(0, -1)) {
      cursor = TokenResolver.ensureNestedTokenMap(cursor, segment);
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

  private static flattenTokens(tokens: TokenMap): Map<string, TokenValue> {
    return new Map(
      flattenTokenMap(tokens).map(({ path, token }) => [path, token])
    );
  }

  private static collectRefsFromValue(value: TokenValue["$value"]): string[] {
    return collectFromValue(value, (leaf) => {
      const ref = extractRefPath(leaf);
      return ref ? [ref] : [];
    });
  }

  private static isEligibleDependencyRef(
    ref: string,
    path: string,
    filePaths: Set<string>
  ): boolean {
    if (!filePaths.has(ref)) {
      return false;
    }

    return ref !== path;
  }

  private static incrementInDegree(
    inDegree: Map<string, number>,
    path: string
  ): void {
    inDegree.set(path, (inDegree.get(path) ?? 0) + 1);
  }

  private static registerDependencyEdge(
    edges: Map<string, Set<string>>,
    inDegree: Map<string, number>,
    path: string,
    ref: string
  ): void {
    const neighbors = edges.get(ref);
    if (!neighbors) {
      return;
    }

    if (neighbors.has(path)) {
      return;
    }

    neighbors.add(path);
    TokenResolver.incrementInDegree(inDegree, path);
  }

  private static addDependencyEdge(
    edges: Map<string, Set<string>>,
    inDegree: Map<string, number>,
    filePaths: Set<string>,
    path: string,
    ref: string
  ): void {
    if (!TokenResolver.isEligibleDependencyRef(ref, path, filePaths)) {
      return;
    }

    TokenResolver.registerDependencyEdge(edges, inDegree, path, ref);
  }

  private static buildFileDependencyGraph(
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
      const refs = TokenResolver.collectRefsFromValue(token.$value);

      for (const ref of refs) {
        TokenResolver.addDependencyEdge(edges, inDegree, filePaths, path, ref);
      }
    }

    return { edges, inDegree };
  }

  private static seedZeroDegreeQueue(inDegree: Map<string, number>): string[] {
    const queue: string[] = [];
    for (const [path, degree] of inDegree) {
      if (degree === 0) {
        queue.push(path);
      }
    }

    return queue;
  }

  private static decrementAndEnqueueIfReady(
    neighbor: string,
    inDegree: Map<string, number>,
    queue: string[]
  ): void {
    const nextDegree = (inDegree.get(neighbor) ?? 0) - 1;
    inDegree.set(neighbor, nextDegree);
    if (nextDegree === 0) {
      queue.push(neighbor);
    }
  }

  private static releaseDependents(
    current: string,
    edges: Map<string, Set<string>>,
    inDegree: Map<string, number>,
    queue: string[]
  ): void {
    const neighbors = edges.get(current);
    if (!neighbors) {
      return;
    }

    for (const neighbor of neighbors) {
      TokenResolver.decrementAndEnqueueIfReady(neighbor, inDegree, queue);
    }
  }

  private static getTopologicalOrder(
    edges: Map<string, Set<string>>,
    inDegree: Map<string, number>
  ): string[] {
    const queue = TokenResolver.seedZeroDegreeQueue(inDegree);
    const order: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        break;
      }

      order.push(current);
      TokenResolver.releaseDependents(current, edges, inDegree, queue);
    }

    return order;
  }

  private static resolveOrderedTokens(
    order: string[],
    fileFlat: Map<string, TokenValue>,
    filePaths: Set<string>
  ): Map<string, TokenValue> {
    const localResolved = new Map<string, TokenValue>();

    for (const path of order) {
      const token = fileFlat.get(path);
      if (!token) {
        continue;
      }

      localResolved.set(path, {
        ...token,
        $value: TokenResolver.resolveLocalValue(
          token.$value,
          path,
          filePaths,
          localResolved
        ),
      });
    }

    return localResolved;
  }

  private static findCycleNodes(inDegree: Map<string, number>): string[] {
    const cycleNodes: string[] = [];
    for (const [path, degree] of inDegree) {
      if (degree > 0) {
        cycleNodes.push(path);
      }
    }

    return cycleNodes;
  }

  private static fillUnresolved(
    fileFlat: Map<string, TokenValue>,
    localResolved: Map<string, TokenValue>
  ): void {
    for (const [path, token] of fileFlat) {
      if (!localResolved.has(path)) {
        localResolved.set(path, token);
      }
    }
  }

  private recordCycleIfPresent(
    file: string,
    inDegree: Map<string, number>
  ): void {
    const cycleNodes = TokenResolver.findCycleNodes(inDegree);
    if (cycleNodes.length === 0) {
      return;
    }

    this.errors.push({
      file,
      message: `Cycle detected in ${file}: ${cycleNodes.join(" → ")}`,
      path: cycleNodes,
      type: "cycle_detected",
    });
  }

  private resolveFileDependencies(
    file: string,
    tree: TokenMap
  ): Map<string, TokenValue> {
    const fileFlat = TokenResolver.flattenTokens(tree);
    const filePaths = new Set(fileFlat.keys());
    const { edges, inDegree } = TokenResolver.buildFileDependencyGraph(
      fileFlat,
      filePaths
    );
    const order = TokenResolver.getTopologicalOrder(edges, inDegree);
    const localResolved = TokenResolver.resolveOrderedTokens(
      order,
      fileFlat,
      filePaths
    );

    if (order.length !== fileFlat.size) {
      this.recordCycleIfPresent(file, inDegree);
      TokenResolver.fillUnresolved(fileFlat, localResolved);
    }

    return localResolved;
  }

  private resolveLocalFileDependencies(
    fileTokens: Record<string, TokenMap>
  ): Map<string, TokenValue> {
    const resolved = new Map<string, TokenValue>();

    for (const [file, tree] of Object.entries(fileTokens)) {
      const localResolved = this.resolveFileDependencies(file, tree);

      for (const [path, token] of localResolved) {
        resolved.set(path, token);
      }
    }

    return resolved;
  }

  private static isResolvableLocalRef(
    refPath: string | null,
    tokenPath: string,
    filePaths: Set<string>
  ): refPath is string {
    if (!refPath) {
      return false;
    }

    if (!filePaths.has(refPath)) {
      return false;
    }

    return refPath !== tokenPath;
  }

  private static resolveLocalRefString(
    value: string,
    tokenPath: string,
    filePaths: Set<string>,
    localResolved: Map<string, TokenValue>
  ): TokenValue["$value"] {
    const refPath = extractRefPath(value);
    if (!TokenResolver.isResolvableLocalRef(refPath, tokenPath, filePaths)) {
      return value;
    }

    const refToken = localResolved.get(refPath);
    return refToken ? refToken.$value : value;
  }

  private static resolveLocalValue(
    value: TokenValue["$value"],
    tokenPath: string,
    filePaths: Set<string>,
    localResolved: Map<string, TokenValue>
  ): TokenValue["$value"] {
    return mapValueLeaves(value, (leaf) =>
      TokenResolver.resolveLocalRefString(
        leaf,
        tokenPath,
        filePaths,
        localResolved
      )
    );
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

  private static isExcludedModeFile(
    lower: string,
    prefix: string,
    keepSuffix: string
  ): boolean {
    return lower.startsWith(prefix) && !lower.includes(keepSuffix);
  }

  private static shouldIncludeInBaseMerge(fileName: string): boolean {
    const lower = fileName.toLowerCase();

    if (
      TokenResolver.isExcludedModeFile(
        lower,
        "primitive_densitive_mode",
        "default"
      )
    ) {
      return false;
    }

    if (
      TokenResolver.isExcludedModeFile(
        lower,
        "primitive_device_mode",
        "desktop"
      )
    ) {
      return false;
    }

    return true;
  }

  private mergeEntry(
    target: TokenMap,
    key: string,
    value: TokenValue | TokenMap
  ): void {
    if (isTokenValue(value)) {
      target[key] = value;
      return;
    }

    if (!isObjectRecord(value)) {
      return;
    }

    const existing = target[key];
    const nestedTarget = isObjectRecord(existing)
      ? (existing as TokenMap)
      : ({} as TokenMap);
    target[key] = nestedTarget;
    this.deepMerge(nestedTarget, value as TokenMap);
  }

  private deepMerge(target: TokenMap, source: TokenMap): void {
    for (const [key, value] of Object.entries(source)) {
      this.mergeEntry(target, key, value);
    }
  }

  private resolveReferencesTree(tokens: TokenMap): TokenMap {
    return mapTokenTree(
      tokens,
      (token, path) => this.resolveTokenByPath(path) ?? token
    );
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

  private resolveStringValue(
    value: string,
    tokenPath: string
  ): TokenValue["$value"] {
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

  private resolveValue(
    value: TokenValue["$value"],
    tokenPath: string
  ): TokenValue["$value"] {
    return mapValueLeaves(value, (leaf) =>
      this.resolveStringValue(leaf, tokenPath)
    );
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
