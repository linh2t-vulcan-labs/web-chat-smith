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

export const extractRefPath = (value: string): string | null => {
  if (value.startsWith("$")) {
    const ref = value.slice(1).trim();
    return ref.length > 0 ? ref : null;
  }

  const match = value.match(REF_REGEX);
  const ref = match?.[1]?.trim() ?? "";
  return ref.length > 0 ? ref : null;
};

export const flattenTokenMap = (
  current: TokenMap,
  parentPath = "",
  output: FlatTokenEntry[] = []
): FlatTokenEntry[] => {
  for (const [key, value] of Object.entries(current)) {
    const path = parentPath ? `${parentPath}.${key}` : key;

    if (isTokenValue(value)) {
      output.push({ path, token: value });
      continue;
    }

    if (isObjectRecord(value)) {
      flattenTokenMap(value as TokenMap, path, output);
    }
  }

  return output;
};
