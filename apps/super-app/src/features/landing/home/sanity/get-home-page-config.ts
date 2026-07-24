import { env } from "@cs/env";
import { unstable_cache } from "next/cache";

import { normalizeAIToolLocale } from "@/features/landing/ai-tool/translations/config";
import { safeSanityFetchWithFallback } from "@/libs/sanity";
import type { TSanityMetadata } from "@/libs/sanity";
import type { PageMetadata } from "@/libs/sanity/sanity.types";

import { HOME_PAGE_CONFIG_QUERY } from "./queries";

type HomePageMetadataFields = Pick<
  PageMetadata,
  "title" | "description" | "keywords"
>;

export interface HomePageConfigDocument {
  _id: string;
  _type: "homePageConfig";
  metadata?: HomePageMetadataFields | null;
}

export interface ResolvedHomePageConfig {
  metadata: TSanityMetadata;
}

const EMPTY_METADATA: TSanityMetadata = {
  description: "",
  keywords: "",
  title: "",
};

function resolvePageMetadata(
  raw: HomePageMetadataFields | null | undefined
): TSanityMetadata {
  if (!raw) {
    return EMPTY_METADATA;
  }

  return {
    description: raw.description?.trim() ?? "",
    keywords: raw.keywords?.trim() ?? "",
    title: raw.title?.trim() ?? "",
  };
}

function resolveHomePageConfig(
  doc: HomePageConfigDocument | null
): ResolvedHomePageConfig {
  return {
    metadata: resolvePageMetadata(doc?.metadata),
  };
}

export const getHomePageConfig = unstable_cache(
  async (language: string): Promise<ResolvedHomePageConfig> => {
    const lang = normalizeAIToolLocale(language);

    const doc =
      await safeSanityFetchWithFallback<HomePageConfigDocument | null>(
        HOME_PAGE_CONFIG_QUERY,
        null,
        { lang },
        {
          next: {
            revalidate: env.SANITY_REVALIDATE_TIME,
            tags: ["home-page-config", "home-metadata"],
          },
        }
      );

    return resolveHomePageConfig(doc);
  },
  ["home-page-config"],
  {
    revalidate: env.SANITY_REVALIDATE_TIME,
    tags: ["home-page-config"],
  }
);
