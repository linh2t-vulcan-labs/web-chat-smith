import { env } from "@cs/env";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { normalizeAppLocale } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { safeSanityFetchWithFallback } from "@/libs/sanity";
import { generateMetadataFromAiSeo } from "@/libs/sanity/ai-seo-metadata";
import type { AiSeo } from "@/libs/sanity/sanity.types";
import { HOME_URL } from "@/utils/constants/url";

import { getHomePageConfig } from "./sanity/get-home-page-config";
import { HOME_SEO_QUERY } from "./sanity/queries";

const HOME_METADATA_ICONS: Metadata["icons"] = {
  apple: "/images/logo-v2.png",
  icon: "/images/logo-v2.png",
  other: [
    {
      rel: "apple-touch-icon",
      url: "/images/logo-v2.png",
    },
    {
      rel: "mask-icon",
      url: "/images/logo-v2.png",
    },
  ],
};

function getHomeAiSeo(): Promise<AiSeo | null> {
  return safeSanityFetchWithFallback<AiSeo | null>(
    HOME_SEO_QUERY,
    null,
    {},
    {
      next: {
        revalidate: env.SANITY_REVALIDATE_TIME,
        tags: ["home-seo"],
      },
    }
  );
}

/** Public homepage metadata (`/home`) — `aiSeo` first, then `homePageConfig` `pageMetadata`, then i18n. */
export async function generateHomeMetadata(locale: string): Promise<Metadata> {
  const lang = normalizeAppLocale(locale);
  const t = await getTranslations({
    locale: lang,
    namespace: "common.metadata",
  });
  const [seo, { metadata: cmsMeta }] = await Promise.all([
    getHomeAiSeo(),
    getHomePageConfig(lang),
  ]);

  const fallback = {
    description: cmsMeta.description?.trim() || t("description"),
    title: cmsMeta.title?.trim() || t("title"),
  };

  const metadata = await generateMetadataFromAiSeo(seo, lang, fallback, {
    alternates: {
      hrefLangLocales: routing.locales,
      locale: lang,
      pathname: HOME_URL,
    },
  });

  const keywords = cmsMeta.keywords?.trim() || t("keywords");

  return {
    ...metadata,
    icons: HOME_METADATA_ICONS,
    keywords,
  };
}
