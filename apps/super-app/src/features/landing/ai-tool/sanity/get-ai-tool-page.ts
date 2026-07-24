import { env } from "@cs/env";
import { unstable_cache } from "next/cache";

import { safeSanityFetchWithFallback } from "@/libs/sanity";
import type { AiSeo, AiTool, AiToolFAQs } from "@/libs/sanity/sanity.types";
import type { TBlog } from "@/libs/sanity/types";

import { getGroupIdFromSegment } from "../constants/groups";
import type { AiToolGroupSegment } from "../constants/groups";
import { normalizeAIToolLocale } from "../translations/config";
import type {
  AiToolBannerDocument,
  AiToolSectionResolved,
  AiToolSectionSchemaRow,
} from "../types/types";
import { normalizeAiToolRichText } from "../utils/normalize-rich-text";
import { normalizeResourceBlogRows } from "./helpers/normalize-resource-blog-rows";
import { resolveSectionsForLocale } from "./normalize-sections";
import { AI_TOOL_PAGE_QUERY } from "./queries";

/** Raw GROQ row shape before locale normalization in `getAiToolPage`. */
type AiToolPageQueryDocument = Omit<
  AiTool,
  | "seo"
  | "faq"
  | "sections"
  | "categories"
  | "extra_categories"
  | "banner"
  | "blogs"
> & {
  banner?: AiToolBannerDocument | null;
  sections?: AiToolSectionSchemaRow[] | null;
  seo?: AiSeo | null;
  faq?: AiToolFAQs | null;
  blogs?: unknown[];
  blogTagIds?: string[] | null;
};

/** `aiTool` from GROQ with relations expanded and sections/banner resolved for `language`. */
export type AiToolPageDocument = Omit<
  AiTool,
  | "seo"
  | "faq"
  | "sections"
  | "categories"
  | "extra_categories"
  | "banner"
  | "blogs"
> & {
  banner?: AiToolBannerDocument | null;
  sections?: AiToolSectionResolved[] | null;
  seo?: AiSeo | null;
  faq?: AiToolFAQs | null;
  blogs?: TBlog[];
  blogTagIds?: string[];
};

/** Dedupes across `generateMetadata`, layout, and page (same request + ISR). */
export const getAiToolPage = unstable_cache(
  async (
    language: string,
    group: AiToolGroupSegment,
    slug: string
  ): Promise<AiToolPageDocument | null> => {
    const locale = normalizeAIToolLocale(language);
    const groupId = getGroupIdFromSegment(group);
    if (!groupId) {
      return null;
    }

    const doc =
      await safeSanityFetchWithFallback<AiToolPageQueryDocument | null>(
        AI_TOOL_PAGE_QUERY,
        null,
        { groupId, lang: language, slug },
        {
          next: {
            revalidate: env.SANITY_REVALIDATE_TIME,
            tags: [
              "ai-tool-page",
              `ai-tool-page:${group}`,
              `ai-tool-page:${group}:${slug}`,
              `ai-tool-page:${language}`,
            ],
          },
        }
      );

    if (process.env.NODE_ENV === "development" && doc === null) {
      console.warn(
        "[getAiToolPage] No document matched. Verify Sanity dataset + published content:",
        {
          dataset: env.SANITY_DATASET || "(empty)",
          group,
          groupId,
          lang: language,
          projectIdSet: Boolean(env.SANITY_PROJECT_ID ?? ""),
          slug,
        }
      );
    }

    if (!doc) {
      return null;
    }

    const banner = doc.banner
      ? {
          ...doc.banner,
          heading: normalizeAiToolRichText(doc.banner.heading),
        }
      : doc.banner;

    const linkAiTool = doc.linkAiTool
      ? {
          ...doc.linkAiTool,
          richText: normalizeAiToolRichText(doc.linkAiTool.richText),
        }
      : doc.linkAiTool;

    const blogTagIds = Array.isArray(doc.blogTagIds)
      ? doc.blogTagIds.filter(
          (id): id is string => typeof id === "string" && id.length > 0
        )
      : undefined;

    return {
      ...doc,
      banner,
      blogTagIds: blogTagIds?.length ? blogTagIds : undefined,
      blogs: normalizeResourceBlogRows(doc.blogs),
      linkAiTool,
      sections: resolveSectionsForLocale(doc.sections, locale),
    };
  },
  ["ai-tool-page"],
  {
    revalidate: env.SANITY_REVALIDATE_TIME,
    tags: ["ai-tool-page"],
  }
);
