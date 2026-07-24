import type { RawFlagValue } from "./types";

/**
 * Decoders turn a {@link RawFlagValue} into a typed primitive, always falling
 * back to a caller-provided default instead of throwing.
 */

export const parseBoolean = (raw: RawFlagValue, fallback: boolean): boolean => {
  try {
    return raw.asBoolean();
  } catch {
    return fallback;
  }
};

export const parseString = (raw: RawFlagValue, fallback: string): string => {
  try {
    return raw.asString();
  } catch {
    return fallback;
  }
};

export const parseNumber = (raw: RawFlagValue, fallback: number): number => {
  try {
    const parsed = raw.asNumber();
    return Number.isFinite(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

/**
 * Reads the value as a string and `JSON.parse`s it. Falls back for an empty
 * string, a parse failure, or a parsed value whose shape doesn't match the
 * fallback's (object-vs-primitive, or primitive type mismatch).
 */
export const parseJSON = <TValue>(
  raw: RawFlagValue,
  fallback: TValue
): TValue => {
  try {
    const text = raw.asString();
    if (text.trim() === "") {
      return fallback;
    }
    const parsed: unknown = JSON.parse(text);
    const fallbackIsObject = fallback !== null && typeof fallback === "object";
    if (fallbackIsObject !== (typeof parsed === "object" && parsed !== null)) {
      return fallback;
    }
    if (!fallbackIsObject && typeof parsed !== typeof fallback) {
      return fallback;
    }
    return parsed as TValue;
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
