/**
 * Fixed set of locale keys used by Sanity's `*ByLocale` schemas
 * (`AiToolTitleByLocale`, `AiToolSectionSchema`, `AiToolFaqItemsByLocale`, ...).
 * Kept as a standalone literal tuple because the i18n routing config widens
 * `AIToolLocale` (and `AI_TOOL_LOCALES` elements) to `string` at the type
 * level, so it can no longer be used to index these locale-keyed records.
 */
const LOCALE_RECORD_KEYS = [
  "en",
  "zh",
  "th",
  "ar",
  "es",
  "ko",
  "ja",
  "hi",
] as const;

type LocaleRecordKey = (typeof LOCALE_RECORD_KEYS)[number];

function isLocaleRecordKey(locale: string): locale is LocaleRecordKey {
  return (LOCALE_RECORD_KEYS as readonly string[]).includes(locale);
}

/** Reads `record[locale]`, returning `undefined` when `locale` isn't a known locale key. */
export function pickByLocaleKey<V>(
  record: Partial<Record<LocaleRecordKey, V>>,
  locale: string
): V | undefined {
  return isLocaleRecordKey(locale) ? record[locale] : undefined;
}
