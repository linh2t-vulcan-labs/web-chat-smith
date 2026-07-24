import { env } from "@cs/env";
import { unstable_cache } from "next/cache";
import { cache } from "react";

import { safeSanityFetchWithFallback } from "@/libs/sanity";
import type { AiSeo, AiToolFAQs, Pricing } from "@/libs/sanity/sanity.types";

import { normalizeAIToolLocale } from "../../ai-tool/translations/config";
import { PRICING_BY_LANGUAGE_QUERY } from "./queries";

type PricingQueryDocument = Omit<
  Pricing,
  "seo" | "faq" | "categories" | "extra_categories"
> & {
  seo?: AiSeo | null;
  faq?: AiToolFAQs | null;
};

export type PricingDocument = Omit<
  Pricing,
  "seo" | "faq" | "categories" | "extra_categories"
> & {
  seo?: AiSeo | null;
  faq?: AiToolFAQs | null;
};

const getPricingByLanguage = unstable_cache(
  async (language: string): Promise<PricingDocument | null> => {
    const lang = normalizeAIToolLocale(language);

    const doc = await safeSanityFetchWithFallback<PricingQueryDocument | null>(
      PRICING_BY_LANGUAGE_QUERY,
      null,
      { lang },
      {
        next: {
          revalidate: env.SANITY_REVALIDATE_TIME,
          tags: ["pricing", `pricing:${lang}`],
        },
      }
    );

    if (!doc) {
      return null;
    }

    return doc;
  },
  ["pricing", "by-language"],
  {
    revalidate: env.SANITY_REVALIDATE_TIME,
    tags: ["pricing"],
  }
);

/** Per-request dedupe (e.g. `generateMetadata` + layout) on top of cross-request `unstable_cache`. */
export const getPricing = cache(getPricingByLanguage);
