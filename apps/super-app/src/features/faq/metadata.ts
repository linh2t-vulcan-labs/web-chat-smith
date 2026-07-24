import type { Metadata } from "next";

import { routing } from "@/i18n/routing";
import { buildBasicPageMetadata } from "@/metadata/build-page-metadata";

import { buildFaqPathname } from "./paths";

interface FaqMetadataInput {
  locale: string;
  title: string;
  description?: string;
  categorySlug?: string;
  questionSlug?: string;
}

/** FAQ metadata with canonical URL and hreflang alternates for all supported locales. */
export function generateFaqMetadata({
  locale,
  title,
  description,
  categorySlug,
  questionSlug,
}: FaqMetadataInput): Metadata {
  return buildBasicPageMetadata({
    alternates: {
      hrefLangLocales: routing.locales,
      locale,
      pathname: buildFaqPathname(categorySlug, questionSlug),
    },
    description,
    title,
  });
}
