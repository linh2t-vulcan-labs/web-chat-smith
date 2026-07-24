import type { Metadata } from "next";

import { routing } from "@/i18n/routing";
import { buildBasicPageMetadata } from "@/metadata/build-page-metadata";

interface PolicySeo {
  title?: string;
  brief?: string;
}

export function generatePolicyMetadata(
  policy: { seo?: PolicySeo } | null | undefined,
  locale: string,
  pathname: string,
  fallback: { title: string; description: string },
  options?: { hrefLangLocales?: readonly string[] }
): Metadata {
  return buildBasicPageMetadata({
    alternates: {
      hrefLangLocales: options?.hrefLangLocales ?? routing.locales,
      locale,
      pathname,
    },
    description: policy?.seo?.brief?.trim() || fallback.description,
    title: policy?.seo?.title?.trim() || fallback.title,
  });
}
