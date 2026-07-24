// @cs/env/helpers — Zod Mini coercion helpers for env var parsing.
// per file 01 § @cs/env baseline
//
// Zod Mini has no method-chaining API (no `.optional()`, `.min()`, `.default()`,
// `.transform()` etc. on schema instances) — every wrapper below uses the
// functional/top-level equivalents (`z.optional()`, `z.pipe()`, `.check()`
// with `z.minLength()`/`z.regex()`/`z.refine()`, `z._default()`), per
// https://zod.dev/packages/mini.

import { z } from "@cs/validation";

// `Number("")` and `Number("  ")` are 0, not NaN — reject blanks explicitly so
// an empty env var never silently becomes 0.
const isNumeric = (s: string): boolean =>
  s.trim() !== "" && !Number.isNaN(Number(s));

/** Coerce a string env var to a validated URL string. */
export const envUrl = (message = "expected a valid URL") => z.url(message);

/** Coerce a required string env var to a number. Fails if missing or non-numeric. */
export const envNum = () =>
  z.pipe(
    z.string().check(z.refine(isNumeric, "expected a numeric string")),
    z.transform(Number)
  );

/**
 * Coerce an optional string env var to a number, using a string default.
 * An empty string (e.g. `PORT=` in an .env file) is treated as absent, same
 * as an unset var, so it falls back to the default instead of failing the
 * numeric check.
 * @param defaultStr — numeric string fallback, e.g. "3600"
 */
export const envNumDefault = (defaultStr: string) => {
  const numericString = z
    .string()
    .check(z.refine(isNumeric, "expected a numeric string"));
  return z.pipe(
    z.transform((val: unknown) => (val === "" ? undefined : val)),
    z.pipe(
      z._default(z.optional(numericString), defaultStr),
      z.transform(Number)
    )
  );
};

/**
 * Coerce an optional boolean env var ("true" | "1" → true, anything else → false).
 * @param defaultVal — boolean default when the var is absent (default: false)
 */
export const envBool = (defaultVal = false) =>
  z.pipe(
    z._default(z.optional(z.string()), defaultVal ? "true" : "false"),
    z.transform((s) => {
      const normalized = s.trim().toLowerCase();
      return normalized === "true" || normalized === "1";
    })
  );

/**
 * Assert a server env var is present at the point of use.
 * Server vars that come from Vault are `.optional()` in the schema (so build
 * passes without them), but must exist when actual runtime logic needs them.
 *
 * @example
 *   const secret = requireServerVar("JWT_SECRET", env.JWT_SECRET)
 */
export const requireServerVar = <T>(
  key: string,
  value: T | undefined
): NonNullable<T> => {
  if (value === undefined || value === null || value === ("" as unknown as T)) {
    throw new Error(
      `[@cs/env] Required server var "${key}" is missing — check Vault injection.\n` +
        `  Inspect: bun run prod vault inspect\n` +
        `  Logs:    bun run prod logs web`
    );
  }
  return value as NonNullable<T>;
};

/**
 * Coerce a comma-separated env var into a non-empty array of trimmed, non-blank
 * entries. Fail-closed: an empty or all-blank value rejects (an empty allowlist
 * would silently disable the guard that consumes it).
 * @param message — error shown when the resulting list is empty
 */
export const envCsv = (message = "expected a non-empty comma-separated list") =>
  z.pipe(
    z.string(),
    z
      .transform((s: string) =>
        s
          .split(",")
          .map((part) => part.trim())
          .filter((part) => part.length > 0)
      )
      .check(z.refine((arr) => arr.length > 0, message))
  );

/** Validate a string env var is parseable JSON (value kept as string in output). */
export const envJsonString = (message = "expected valid JSON string") =>
  z.string().check(
    z.refine((s) => {
      try {
        JSON.parse(s);
        return true;
      } catch {
        return false;
      }
    }, message)
  );
