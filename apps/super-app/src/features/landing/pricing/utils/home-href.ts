import { routing } from "@/i18n/routing";
import { PRICING_PAGE_URL } from "@/utils/constants/url";

import {
  DEFAULT_LOCALE,
  normalizeAIToolLocale,
} from "../../ai-tool/translations/config";
import type { AIToolLocale } from "../../ai-tool/translations/config";

/** Home link for breadcrumb / nav (next-intl `as-needed` locale prefix). */
export function buildPricingHomeHref(locale: string): string {
  const normalized = normalizeAIToolLocale(locale) as AIToolLocale;
  return normalized === routing.defaultLocale ? "/home" : `/${normalized}/home`;
}

/** Pricing page path for a locale (`/pricing` for en, `/zh/pricing` for zh). */
export function buildPricingPageHref(locale: string = DEFAULT_LOCALE): string {
  const normalized = normalizeAIToolLocale(locale) as AIToolLocale;
  return normalized === routing.defaultLocale
    ? PRICING_PAGE_URL
    : `/${normalized}${PRICING_PAGE_URL}`;
}
