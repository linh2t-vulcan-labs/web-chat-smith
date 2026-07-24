import { normalizeAppLocale } from "@/i18n/locale";
import { routing } from "@/i18n/routing";

/** Supported AI tool locales — kept in sync with next-intl `routing.locales`. */
export const AI_TOOL_LOCALES = routing.locales;

export type AIToolLocale = (typeof routing.locales)[number];

export const DEFAULT_LOCALE: AIToolLocale = routing.defaultLocale;

/** Maps route locale to a supported AI tool locale (ai-tool scope only). */
export function normalizeAIToolLocale(
  input: string | undefined | null
): AIToolLocale {
  return normalizeAppLocale(input) as AIToolLocale;
}
