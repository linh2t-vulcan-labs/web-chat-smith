import type { RawFlagValue } from "./types";

/**
 * Decoders turn a {@link RawFlagValue} into a typed primitive, always falling
 * back to a caller-provided default instead of throwing.
 */

const parseBoolean = (raw: RawFlagValue, fallback: boolean): boolean => {
  try {
    return raw.asBoolean();
  } catch {
    return fallback;
  }
};

const parseString = (raw: RawFlagValue, fallback: string): string => {
  try {
    return raw.asString();
  } catch {
    return fallback;
  }
};

const parseNumber = (raw: RawFlagValue, fallback: number): number => {
  try {
    const parsed = raw.asNumber();
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const isObjectLike = (value: unknown): boolean =>
  value !== null && typeof value === "object";

/** True when `parsed`'s shape (object-vs-primitive, or primitive type) matches `fallback`'s. */
const matchesFallbackShape = <TValue>(
  parsed: unknown,
  fallback: TValue
): boolean => {
  const fallbackIsObject = isObjectLike(fallback);
  if (fallbackIsObject !== isObjectLike(parsed)) {
    return false;
  }
  return fallbackIsObject || typeof parsed === typeof fallback;
};

/**
 * Reads the value as a string and `JSON.parse`s it. Falls back for an empty
 * string, a parse failure, or a parsed value whose shape doesn't match the
 * fallback's (object-vs-primitive, or primitive type mismatch).
 */
const parseJSON = <TValue>(raw: RawFlagValue, fallback: TValue): TValue => {
  try {
    const text = raw.asString();
    if (text.trim() === "") {
      return fallback;
    }
    const parsed: unknown = JSON.parse(text);
    return matchesFallbackShape(parsed, fallback)
      ? (parsed as TValue)
      : fallback;
  } catch {
    return fallback;
  }
};

export const FLAG_DECODERS = {
  boolean: parseBoolean,
  json: parseJSON,
  number: parseNumber,
  string: parseString,
} as const;
