import { env } from "@cs/env";

import { routing } from "@/i18n/routing";
import { buildSanityImageUrlFromTSanityImageWithPreset } from "@/libs/sanity/image-url";
import { safeSanityFetchWithFallback } from "@/libs/sanity/safe-fetch";
import type { TBlog, TSanityImage } from "@/libs/sanity/types";

import {
  BLOGS_BY_TAG_IDS_QUERY,
  LATEST_BLOGS_FOR_AI_TOOL_QUERY,
} from "../sanity/queries";
import { normalizeAIToolLocale } from "../translations/config";

/** Supported blog locales — kept in sync with next-intl `routing.locales`. */
// const SUPPORTED_BLOG_LANG = routing.locales;
const FALLBACK_BLOG_LANG = routing.defaultLocale;

/** Maps the site locale to a Sanity `blogs.language` value (falls back to `routing.defaultLocale`). */
export function sanityBlogLanguageFromSiteLocale(locale: string): string {
  return normalizeAIToolLocale(locale);
}

function fetchBlogsByLanguage(lang: string): Promise<TBlog[]> {
  return safeSanityFetchWithFallback<TBlog[]>(
    LATEST_BLOGS_FOR_AI_TOOL_QUERY,
    [],
    { lang },
    {
      next: {
        revalidate: env.SANITY_REVALIDATE_TIME,
        tags: ["blogs", `blogs-lang-${lang}`],
      },
    }
  );
}

function fetchBlogsByTagIds(lang: string, tagIds: string[]): Promise<TBlog[]> {
  return safeSanityFetchWithFallback<TBlog[]>(
    BLOGS_BY_TAG_IDS_QUERY,
    [],
    { lang, tagIds },
    {
      next: {
        revalidate: env.SANITY_REVALIDATE_TIME,
        tags: ["blogs", `blogs-lang-${lang}`],
      },
    }
  );
}

/**
 * Latest resource-blog posts for an AI tool page locale.
 * Tries the mapped Sanity language first, then falls back to English when empty.
 */
async function getLatestResourceBlogsForLocale(
  locale: string
): Promise<{ posts: TBlog[]; blogLang: string }> {
  const primaryLang = sanityBlogLanguageFromSiteLocale(locale);
  const posts = await fetchBlogsByLanguage(primaryLang);

  if (posts.length > 0 || primaryLang === FALLBACK_BLOG_LANG) {
    return { blogLang: primaryLang, posts };
  }

  return {
    blogLang: FALLBACK_BLOG_LANG,
    posts: await fetchBlogsByLanguage(FALLBACK_BLOG_LANG),
  };
}

/**
 * Resource blogs for an AI tool page.
 * Priority: direct blog refs > blogTags (max 12) > latest by locale.
 */
export async function getResourceBlogsForAiTool(
  locale: string,
  referencedBlogs?: TBlog[] | null,
  blogTagIds?: string[] | null
): Promise<{ posts: TBlog[]; blogLang: string }> {
  // Priority 1: curated direct blog references
  if (referencedBlogs?.length) {
    const blogLang =
      referencedBlogs.find((blog) => blog.language?.trim())?.language?.trim() ||
      sanityBlogLanguageFromSiteLocale(locale);
    return { blogLang, posts: referencedBlogs };
  }

  // Priority 2: filter by blogTags
  if (blogTagIds?.length) {
    const primaryLang = sanityBlogLanguageFromSiteLocale(locale);
    const posts = await fetchBlogsByTagIds(primaryLang, blogTagIds);
    if (posts.length > 0 || primaryLang === FALLBACK_BLOG_LANG) {
      return { blogLang: primaryLang, posts };
    }
    const fallbackPosts = await fetchBlogsByTagIds(
      FALLBACK_BLOG_LANG,
      blogTagIds
    );
    if (fallbackPosts.length > 0) {
      return { blogLang: FALLBACK_BLOG_LANG, posts: fallbackPosts };
    }
  }

  // Priority 3: latest by locale
  return getLatestResourceBlogsForLocale(locale);
}

export const DEFAULT_AUTHOR_IMAGE = "/images/logo-v2.png";

type ImagePreset = Parameters<
  typeof buildSanityImageUrlFromTSanityImageWithPreset
>[1];

export type OptimizedResourceBlog = TBlog & {
  optimizedImage: string;
  optimizedAuthorImage?: string;
};

function optimizeImage(
  image: TSanityImage | null | undefined,
  preset: ImagePreset,
  fallbackUrl?: string
): Promise<string | null> {
  if (!image) {
    return Promise.resolve(fallbackUrl || null);
  }
  return buildSanityImageUrlFromTSanityImageWithPreset(image, preset).catch(
    () => fallbackUrl || image.url
  );
}

/**
 * Returns `null` when the document has no main image (Sanity may omit it while types still expect it).
 * Main image uses one `aiToolResourceBlogCard` URL (388×206, `fit: max`); no responsive srcSet.
 */
export async function optimizeResourceBlogImages(
  blog: TBlog
): Promise<OptimizedResourceBlog | null> {
  const { image } = blog;
  if (!image?.url) {
    return null;
  }

  const [optimizedImage, optimizedAuthorImage] = await Promise.all([
    optimizeImage(image, "aiToolResourceBlogCard", image.url),
    blog.authorImage?.url
      ? optimizeImage(blog.authorImage, "avatar", blog.authorImage.url)
      : null,
  ]);

  return {
    ...blog,
    image,
    optimizedAuthorImage: optimizedAuthorImage || undefined,
    optimizedImage: optimizedImage || image.url,
  };
}
