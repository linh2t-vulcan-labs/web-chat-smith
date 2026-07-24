import type { Metadata } from "next";

import { routing } from "@/i18n/routing";
import { generateMetadataFromAiSeo } from "@/libs/sanity/ai-seo-metadata";
import type { AiSeo } from "@/libs/sanity/sanity.types";
import { PRICING_PAGE_URL } from "@/utils/constants/url";

import type { AIToolLocale } from "../../ai-tool/translations/config";

const PRICING_METADATA_FALLBACK = {
  description:
    "Compare Chat Smith plans and choose the right subscription for AI chat, image generation, and productivity features.",
  title: "Pricing | Chat Smith",
};

export function generatePricingMetadata(
  seo: AiSeo | null | undefined,
  locale: AIToolLocale
): Promise<Metadata> {
  return generateMetadataFromAiSeo(seo, locale, PRICING_METADATA_FALLBACK, {
    alternates: {
      hrefLangLocales: routing.locales,
      locale,
      pathname: PRICING_PAGE_URL,
    },
  });
}
