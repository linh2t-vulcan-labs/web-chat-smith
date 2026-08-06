import type { Locale } from "./constants";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "./constants";

export type Messages = Record<string, unknown>;

type LocaleConfig = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_CONFIG_BY_VALUE = Object.fromEntries(
  SUPPORTED_LOCALES.map((item) => [item.value, item])
) as Record<Locale, LocaleConfig>;

const LOCALE_SUBTAG_SEPARATOR = /[-_]/u;

/**
 * Extracts the primary language subtag from a locale tag
 * (e.g. "en" from "en-US", "zh" from "zh-Hans" or "zh-CN").
 */
export const getBaseLocale = (
  locale: string | undefined
): string | undefined => {
  if (!locale) {
    return undefined;
  }

  const [base] = locale.toLowerCase().split(LOCALE_SUBTAG_SEPARATOR);
  return base?.toLowerCase();
};

/**
 * Maps a primary language subtag (e.g. "zh") to the configured locale that
 * uses it (e.g. "zh-Hans"). Lets requests like "zh-CN" or "zh" resolve to a
 * configured locale even when that locale itself carries extra subtags.
 */
const LOCALE_BY_BASE_TAG = Object.fromEntries(
  SUPPORTED_LOCALES.map((item) => [getBaseLocale(item.value), item.value])
) as Record<string, Locale>;

/**
 * Type Guard Function O(1) dựa trên map dựng sẵn từ SUPPORTED_LOCALES.
 */
export const isValidLocale = (value: unknown): value is Locale =>
  typeof value === "string" && Object.hasOwn(LOCALE_CONFIG_BY_VALUE, value);

/**
 * Tra cứu cấu hình locale với tốc độ O(1) qua map dựng sẵn.
 * Fallback về DEFAULT_LOCALE khi không tìm thấy.
 */
export const getLocaleConfig = (value: unknown): LocaleConfig =>
  isValidLocale(value)
    ? LOCALE_CONFIG_BY_VALUE[value]
    : LOCALE_CONFIG_BY_VALUE[DEFAULT_LOCALE];

/**
 * Resolves a requested locale tag (exact or base subtag, e.g. "zh-CN") to the
 * configured locale that should serve it, or undefined if there's no match.
 */
export const resolveConfiguredLocale = (
  requested: string | undefined
): Locale | undefined => {
  if (isValidLocale(requested)) {
    return requested;
  }

  const baseTag = getBaseLocale(requested);
  return baseTag ? LOCALE_BY_BASE_TAG[baseTag] : undefined;
};

/**
 * Dedupes a list of locale candidates while preserving order (first occurrence wins).
 */
export const toUniqueLocales = (locales: (string | undefined)[]): string[] => {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const locale of locales) {
    if (!locale || seen.has(locale)) {
      continue;
    }

    seen.add(locale);
    unique.push(locale);
  }

  return unique;
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isEmptyTranslation = (value: unknown): boolean =>
  typeof value === "string" && value.trim().length === 0;

/** Sentinel returned by `resolveLeafValue` when the override key should be skipped entirely (base value kept as-is). */
const SKIP_MERGE = Symbol("skip-merge");

/** Resolves a non-object override value: skip empty translation strings (fall back to base), otherwise take the override as-is. */
const resolveLeafValue = (overrideValue: unknown): unknown =>
  isEmptyTranslation(overrideValue) ? SKIP_MERGE : overrideValue;

/**
 * Deep-merges override messages onto base messages. Empty translation strings
 * in the override are skipped so the base locale's text remains as a fallback.
 */
export const mergeMessages = (base: Messages, override: Messages): Messages => {
  const result: Messages = { ...base };

  for (const [key, overrideValue] of Object.entries(override)) {
    const baseValue = result[key];

    if (isObjectRecord(baseValue) && isObjectRecord(overrideValue)) {
      result[key] = mergeMessages(baseValue, overrideValue);
      continue;
    }

    const merged = resolveLeafValue(overrideValue);
    if (merged !== SKIP_MERGE) {
      result[key] = merged;
    }
  }

  return result;
};
