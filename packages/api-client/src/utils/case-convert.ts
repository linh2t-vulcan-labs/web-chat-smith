const SNAKE_TO_CAMEL = /_(?<char>[a-z0-9])/gu;
// Acronym boundary first (e.g. "HTMLElement" -> "HTML_Element", the run of
// capitals stays together up to the one that starts the next word), then the
// plain lower/digit -> upper boundary (e.g. "avatarUrl" -> "avatar_Url"). A
// single `/[A-Z]/g` pass (this file's original approach) would instead
// under-score EVERY capital individually — "avatarURL" -> "avatar_u_r_l",
// "userID" -> "user_i_d" — silently mangling any backend field with a
// multi-letter acronym, since this transform runs on every request
// body/query param with no per-field override.
const ACRONYM_BOUNDARY = /(?<run>[A-Z]+)(?<next>[A-Z][a-z0-9])/gu;
const CAMEL_BOUNDARY = /(?<prev>[a-z0-9])(?<next>[A-Z])/gu;

const camelCaseKey = (key: string) =>
  key.replace(SNAKE_TO_CAMEL, (_match, char: string) => char.toUpperCase());

const snakeCaseKey = (key: string) =>
  key
    .replace(ACRONYM_BOUNDARY, "$<run>_$<next>")
    .replace(CAMEL_BOUNDARY, "$<prev>_$<next>")
    .toLowerCase();

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" &&
  value !== null &&
  !Array.isArray(value) &&
  !(value instanceof Date);

/**
 * Deep key conversion, replacing the class-transformer decorator ceremony
 * the legacy code used per-DTO (see docs/runbook/api-client.md §2/§7).
 */
export const toCamelCase = <T>(input: unknown): T => {
  if (Array.isArray(input)) {
    return input.map((item) => toCamelCase(item)) as T;
  }
  if (isPlainObject(input)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      result[camelCaseKey(key)] = toCamelCase(value);
    }
    return result as T;
  }
  return input as T;
};

export const toSnakeCase = <T>(input: unknown): T => {
  if (Array.isArray(input)) {
    return input.map((item) => toSnakeCase(item)) as T;
  }
  if (isPlainObject(input)) {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      result[snakeCaseKey(key)] = toSnakeCase(value);
    }
    return result as T;
  }
  return input as T;
};
