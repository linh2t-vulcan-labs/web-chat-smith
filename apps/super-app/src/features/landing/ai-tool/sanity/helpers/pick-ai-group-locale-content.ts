import { routing } from "@/i18n/routing";
import type {
  AiGroupConfig,
  AiGroupConfigLocaleContent,
} from "@/libs/sanity/sanity.types";

import type { AIToolLocale } from "../../translations/config";

const AI_GROUP_LOCALE_KEYS = [
  "en",
  "zh",
  "th",
  "ar",
  "es",
  "ko",
  "ja",
  "hi",
] as const;

type AiGroupLocaleKey = (typeof AI_GROUP_LOCALE_KEYS)[number];

/** Locale blocks used by `pickAiGroupLocaleContent` (GROQ row with or without expanded `seo`). */
export type AiGroupConfigLocaleSource = Pick<AiGroupConfig, "_id" | "_type"> &
  Partial<Record<AiGroupLocaleKey, AiGroupConfigLocaleContent | undefined>>;

function isAiGroupConfig(config: unknown): config is AiGroupConfigLocaleSource {
  if (!config || typeof config !== "object") {
    return false;
  }
  const record = config as AiGroupConfigLocaleSource;
  return record._type === "aiGroupConfig" || Boolean(record._id);
}

function hasAiGroupLocaleContent(
  content?: AiGroupConfigLocaleContent | null
): boolean {
  if (!content) {
    return false;
  }
  return Boolean(content.title?.trim() || content.description?.trim());
}

function readAiGroupLocaleBlock(
  config: AiGroupConfigLocaleSource,
  key: AiGroupLocaleKey
): AiGroupConfigLocaleContent | undefined {
  const block = config[key];
  return hasAiGroupLocaleContent(block) ? block : undefined;
}

/** Picks `aiGroupConfig` locale content for the active route locale, then routing locales, then any CMS locale. */
export function pickAiGroupLocaleContent(
  config: AiGroupConfigLocaleSource | null | undefined,
  locale: AIToolLocale
): AiGroupConfigLocaleContent | undefined {
  if (!isAiGroupConfig(config)) {
    return undefined;
  }

  const preferred = readAiGroupLocaleBlock(config, locale as AiGroupLocaleKey);
  if (preferred) {
    return preferred;
  }

  for (const loc of routing.locales) {
    const fallback = readAiGroupLocaleBlock(config, loc as AiGroupLocaleKey);
    if (fallback) {
      return fallback;
    }
  }

  for (const loc of AI_GROUP_LOCALE_KEYS) {
    const fallback = readAiGroupLocaleBlock(config, loc);
    if (fallback) {
      return fallback;
    }
  }

  return undefined;
}
