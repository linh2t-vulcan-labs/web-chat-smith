import type { TokenMap, TokenValue } from "../resolver";

const REF_REGEX = /^\{(?<ref>[^{}]+)\}$/u;

export interface FlatTokenEntry {
  path: string;
  token: TokenValue;
}

export const isObjectRecord = (
  value: unknown
): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const isTokenValue = (value: unknown): value is TokenValue =>
  isObjectRecord(value) && "$value" in value && "$type" in value;

const nonEmptyOrNull = (value: string): string | null =>
  value.length > 0 ? value : null;

export const extractRefPath = (value: string): string | null => {
  if (value.startsWith("$")) {
    return nonEmptyOrNull(value.slice(1).trim());
  }

  const match = value.match(REF_REGEX);
  return nonEmptyOrNull(match?.[1]?.trim() ?? "");
};

/** Joins a token tree's dotted path segments, omitting the leading dot at the root. */
export const joinTokenPath = (parentPath: string, key: string): string =>
  parentPath ? `${parentPath}.${key}` : key;

/**
 * Walks a token tree depth-first, invoking `visitToken` for every leaf token
 * with its full dotted path. Non-token object nodes are recursed into.
 * Shared by validators that only differ in what they check per token (SSR
 * safety, ref resolution).
 */
export const walkTokenTree = (
  tokens: TokenMap,
  visitToken: (token: TokenValue, path: string) => void,
  parentPath = ""
): void => {
  for (const [key, value] of Object.entries(tokens)) {
    const path = joinTokenPath(parentPath, key);

    if (isTokenValue(value)) {
      visitToken(value, path);
      continue;
    }

    if (isObjectRecord(value)) {
      walkTokenTree(value as TokenMap, visitToken, path);
    }
  }
};

export const flattenTokenMap = (
  current: TokenMap,
  parentPath = "",
  output: FlatTokenEntry[] = []
): FlatTokenEntry[] => {
  walkTokenTree(
    current,
    (token, path) => {
      output.push({ path, token });
    },
    parentPath
  );

  return output;
};

/**
 * Walks a token tree and rewrites every leaf token via `mapToken`, leaving
 * the tree shape untouched. Shared by normalizers/resolvers that only differ
 * in how a single token gets rewritten.
 */
export const mapTokenTree = (
  tokens: TokenMap,
  mapToken: (token: TokenValue, path: string) => TokenValue,
  parentPath = ""
): TokenMap => {
  const result: TokenMap = {};

  for (const [key, value] of Object.entries(tokens)) {
    const path = joinTokenPath(parentPath, key);

    if (isTokenValue(value)) {
      result[key] = mapToken(value, path);
      continue;
    }

    if (isObjectRecord(value)) {
      result[key] = mapTokenTree(value as TokenMap, mapToken, path);
      continue;
    }

    result[key] = value as TokenValue;
  }

  return result;
};

/**
 * Walks a token `$value` (string | array | object) and rewrites every string
 * leaf via `mapString`, preserving array/object structure. Shared by
 * resolvers that only differ in how they resolve a single string leaf (local
 * vs. cross-file reference resolution).
 */
export const mapValueLeaves = (
  value: TokenValue["$value"],
  mapString: (leaf: string) => TokenValue["$value"]
): TokenValue["$value"] => {
  if (typeof value === "string") {
    return mapString(value);
  }

  if (Array.isArray(value)) {
    return value.map((item) =>
      mapValueLeaves(item as TokenValue["$value"], mapString)
    );
  }

  if (isObjectRecord(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [
        key,
        mapValueLeaves(nested as TokenValue["$value"], mapString),
      ])
    );
  }

  return value;
};

/**
 * Walks a token `$value` and collects results from every string leaf via
 * `fromString`, flattening across arrays/objects. Shared by validators and
 * resolvers that need every reference string embedded in a value (e.g.
 * dependency graph edges, ref validation).
 */
export const collectFromValue = <T>(
  value: unknown,
  fromString: (leaf: string) => T[]
): T[] => {
  if (typeof value === "string") {
    return fromString(value);
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => collectFromValue<T>(item, fromString));
  }

  if (isObjectRecord(value)) {
    return Object.values(value).flatMap((item) =>
      collectFromValue<T>(item, fromString)
    );
  }

  return [];
};

/** Converts a bare number to a `px` length, passing through anything else. */
export const toPxValue = (value: unknown): unknown =>
  typeof value === "number" ? `${value}px` : value;

/**
 * Walks a token tree and rewrites `dimension` tokens whose path matches
 * `pathMatches` into `px` values, leaving every other node untouched.
 * Shared by normalizers that only differ in which paths they target
 * (e.g. radius vs. spacing).
 */
const toPxDimensionToken = (token: TokenValue): TokenValue => ({
  ...token,
  $value: toPxValue(token.$value) as TokenValue["$value"],
});

export const mapPathMatchedDimensionTokens = (
  tokens: TokenMap,
  pathMatches: (path: string) => boolean,
  parentPath = ""
): TokenMap =>
  mapTokenTree(
    tokens,
    (token, path) =>
      pathMatches(path) && token.$type === "dimension"
        ? toPxDimensionToken(token)
        : token,
    parentPath
  );

/**
 * Walks a token tree and rewrites every token whose `$type` matches `type`
 * by applying `transform` to its `$value`, leaving every other node
 * untouched. Shared by normalizers that only differ in which `$type` they
 * target and how they transform the value (e.g. border vs. shadow).
 */
export const mapTokensOfType = (
  tokens: TokenMap,
  type: string,
  transform: (value: unknown) => unknown
): TokenMap =>
  mapTokenTree(tokens, (token) =>
    token.$type === type
      ? ({ ...token, $value: transform(token.$value) } as TokenValue)
      : token
  );
