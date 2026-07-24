import type { Metadata } from "next";

import { routing } from "@/i18n/routing";
import { buildPageAlternates, withPageAlternates } from "@/metadata/alternates";
import type { PageAlternatesInput } from "@/metadata/alternates";

import { buildSanityImageUrl } from "./image-url";
import type { AiSeo, AiSeoLocaleContent } from "./sanity.types";

/** Locale keys on `aiSeo` documents (includes CMS-only locales not in next-intl routing). */
const AI_SEO_LOCALE_KEYS = [
  "en",
  "zh",
  "th",
  "ar",
  "es",
  "ko",
  "ja",
  "hi",
] as const;

export type AiSeoLocaleKey = (typeof AI_SEO_LOCALE_KEYS)[number];

export type AiSeoRoutingLocale = (typeof routing.locales)[number];

function isAiSeoDocument(seo: unknown): seo is AiSeo {
  return Boolean(
    seo && typeof seo === "object" && "_type" in seo && seo._type === "aiSeo"
  );
}

function hasAiSeoLocaleContent(content?: AiSeoLocaleContent | null): boolean {
  if (!content) {
    return false;
  }
  return Boolean(
    content.title?.trim() ||
    content.description?.trim() ||
    content.ogImage?.asset
  );
}

function readAiSeoLocaleBlock(
  seo: AiSeo,
  key: AiSeoLocaleKey
): AiSeoLocaleContent | undefined {
  const block = seo[key];
  return hasAiSeoLocaleContent(block) ? block : undefined;
}

/**
 * Picks `aiSeo` locale content for the active route locale, then routing locales, then any CMS locale.
 */
export function pickAiSeoLocaleContent(
  seo: AiSeo | null | undefined,
  locale: AiSeoRoutingLocale
): AiSeoLocaleContent | undefined {
  if (!seo || !isAiSeoDocument(seo)) {
    return undefined;
  }

  const preferred = readAiSeoLocaleBlock(seo, locale as AiSeoLocaleKey);
  if (preferred) {
    return preferred;
  }

  for (const loc of routing.locales) {
    const fallback = readAiSeoLocaleBlock(seo, loc as AiSeoLocaleKey);
    if (fallback) {
      return fallback;
    }
  }

  for (const loc of AI_SEO_LOCALE_KEYS) {
    const fallback = readAiSeoLocaleBlock(seo, loc);
    if (fallback) {
      return fallback;
    }
  }

  return undefined;
}

export interface AiSeoMetadataOptions {
  alternates?: PageAlternatesInput;
}

async function buildMetadataFromAiSeoLocaleContent(
  content: AiSeoLocaleContent | undefined,
  fallback: { title: string; description: string },
  options?: AiSeoMetadataOptions
): Promise<Metadata> {
  const title = content?.title?.trim() || fallback.title;
  const description = content?.description?.trim() || fallback.description;
  const ogImageAlt = content?.ogImageAlt?.trim();

  const ogImageUrl = content?.ogImage?.asset
    ? await buildSanityImageUrl(content.ogImage, {
        format: "auto",
        height: 630,
        quality: 85,
        width: 1200,
      })
    : null;

  let metadata: Metadata = {
    description,
    keywords: undefined,
    title,
  };

  if (ogImageUrl) {
    metadata.openGraph = {
      description,
      images: [{ url: ogImageUrl, ...(ogImageAlt ? { alt: ogImageAlt } : {}) }],
      title,
      type: "website",
    };
    metadata.twitter = {
      card: "summary_large_image",
      description,
      images: [ogImageUrl],
      title,
    };
  }

  if (options?.alternates) {
    metadata = withPageAlternates(
      metadata,
      buildPageAlternates(options.alternates)
    );
  }

  return metadata;
}

export function generateMetadataFromAiSeo(
  seo: unknown,
  locale: AiSeoRoutingLocale,
  fallback: { title: string; description: string },
  options?: AiSeoMetadataOptions
): Promise<Metadata> {
  const doc = isAiSeoDocument(seo) ? seo : null;
  const content = pickAiSeoLocaleContent(doc, locale);
  return buildMetadataFromAiSeoLocaleContent(content, fallback, options);
}
