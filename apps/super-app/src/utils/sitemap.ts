import { FAQ_DATA_EN } from "@/config/faq/en";
import { attachCanonicalFaqSlugs } from "@/config/faq/faq-canonical-slugs";
import { getSegmentFromGroupId } from "@/features/landing/ai-tool/constants/groups";
import { routing } from "@/i18n/routing";
import type {
  TSanityAiToolPageSitemap,
  TSanityBlog,
  TTotalBlogResponse,
} from "@/libs/sanity";
import { safeSanityFetchWithFallback, TOTAL_BLOGS_QUERY } from "@/libs/sanity";

import {
  extractAllFaqQuestion,
  getFaqQuestionPathSegment,
} from "./commons/faq";
import { getBlogDetailUrl } from "./commons/helpers";
import { BLOGS_URL, FAQ_URL, PRICING_PAGE_URL } from "./constants/url";

const SITEMAP_ROUTING_LOCALES = routing.locales;

function getLocalizedLandingPath(path: string, locale: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return locale === routing.defaultLocale
    ? normalized
    : `/${locale}${normalized}`;
}

export const BLOGS_PER_SITEMAP = 50_000;

type TChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

interface TStaticSiteUrl {
  url: string;
  lastModified: string;
  priority: number;
}

export async function generateSitemaps() {
  // Falls back to a single empty sitemap on Sanity error instead of crashing
  // the whole build — matches the safe-fetch pattern used elsewhere (e.g.
  // app/llms.txt/route.ts), since /sitemap.xml previously had no fallback and
  // a transient Sanity outage during build would take down the entire app.
  const totalBlogsResult =
    await safeSanityFetchWithFallback<TTotalBlogResponse>(TOTAL_BLOGS_QUERY, {
      total: 0,
    });
  const totalBlogs = totalBlogsResult.total || 0;

  // Calculate the number of sitemaps needed
  const numberOfSitemaps = Math.ceil(totalBlogs / BLOGS_PER_SITEMAP);

  // Generate an array of sitemap objects
  const sitemaps = Array.from({ length: numberOfSitemaps }, (_, index) => ({
    id: index,
  }));

  return sitemaps;
}

export const getFaqSitemaps = (domain: string) => {
  const ALL_FAQ_QUESTIONS = extractAllFaqQuestion(
    attachCanonicalFaqSlugs(FAQ_DATA_EN)
  );
  return ALL_FAQ_QUESTIONS.map((faq) => {
    const faqUrl = `${domain}${FAQ_URL}/${faq.categoryPathSegment}/${getFaqQuestionPathSegment(faq)}`;
    const lastMod = new Date("2025-07-25").toISOString();
    return `
        <url>
          <loc>${faqUrl}</loc>
          <lastmod>${lastMod}</lastmod>
          <priority>0.8</priority>
        </url>
      `;
  });
};

export const getStaticSitemaps = (data: TStaticSiteUrl[] = []) =>
  data.map(
    (d) =>
      `
        <url>
          <loc>${d.url}</loc>
          <lastmod>${d.lastModified}</lastmod>
          <priority>${d.priority}</priority>
        </url>
      `
  );

/** Path for `/{group}/{slug}` respecting next-intl `localePrefix: as-needed`. */
function getAiToolPageDetailUrl(
  locale: string,
  group: string,
  slug: string
): string {
  const path = `/${group}/${slug}`;
  if (locale === routing.defaultLocale) {
    return path;
  }
  return `/${locale}${path}`;
}

function buildSitemapUrlEntry({
  loc,
  lastmod,
  changeFrequency,
  priority,
}: {
  loc: string;
  lastmod: string;
  changeFrequency?: TChangeFrequency;
  priority: number;
}): string {
  const changefreqLine = changeFrequency
    ? `\n          <changefreq>${changeFrequency}</changefreq>`
    : "";
  return `
        <url>
          <loc>${loc}</loc>
          <lastmod>${lastmod}</lastmod>${changefreqLine}
          <priority>${priority}</priority>
        </url>
      `;
}

interface AiToolPageSitemapEntry {
  path: string;
  lastmod: string;
}

/** Sanity rows for AI tool landing pages (`/{group}/{slug}` per locale). */
export function getAiToolPageSitemaps({
  baseUrl,
  data,
  changeFrequency,
  priority,
}: {
  baseUrl: string;
  data: TSanityAiToolPageSitemap[];
  changeFrequency: TChangeFrequency;
  priority: number;
}): string[] {
  const entries = new Map<string, AiToolPageSitemapEntry>();

  for (const row of data) {
    const slug = row.slug?.trim();
    const locale = row.language?.trim();
    const groupId = row.groupId?.trim();
    if (!slug || !locale || !groupId) {
      continue;
    }
    if (!(SITEMAP_ROUTING_LOCALES as readonly string[]).includes(locale)) {
      continue;
    }

    const group = getSegmentFromGroupId(groupId);
    if (!group) {
      continue;
    }

    const path = getAiToolPageDetailUrl(locale, group, slug);
    entries.set(path, {
      lastmod: new Date(row._updatedAt).toISOString(),
      path,
    });
  }

  return [...entries.values()].map((entry) =>
    buildSitemapUrlEntry({
      changeFrequency,
      lastmod: entry.lastmod,
      loc: `${baseUrl}${entry.path}`,
      priority,
    })
  );
}

/** `/pricing` for default locale, `/{locale}/pricing` for others. */
export function getPricingSitemaps({
  baseUrl,
  lastModified,
  priority = 0.9,
}: {
  baseUrl: string;
  lastModified: string;
  priority?: number;
}): string[] {
  return SITEMAP_ROUTING_LOCALES.map((locale) =>
    buildSitemapUrlEntry({
      lastmod: lastModified,
      loc: `${baseUrl}${getLocalizedLandingPath(PRICING_PAGE_URL, locale)}`,
      priority,
    })
  );
}

/** `/blogs` for default locale, `/{locale}/blogs` for others. */
export function getBlogsListingSitemaps({
  baseUrl,
  lastModified,
  priority = 0.9,
}: {
  baseUrl: string;
  lastModified: string;
  priority?: number;
}): string[] {
  return SITEMAP_ROUTING_LOCALES.map((locale) =>
    buildSitemapUrlEntry({
      lastmod: lastModified,
      loc: `${baseUrl}${getLocalizedLandingPath(BLOGS_URL, locale)}`,
      priority,
    })
  );
}

export const getBlogsSitemaps = ({
  baseUrl,
  data,
  changeFrequency,
  priority,
}: {
  baseUrl: string;
  data: TSanityBlog[];
  changeFrequency: TChangeFrequency;
  priority: number;
}) =>
  data.map((d) => {
    const loc = `${baseUrl}${getBlogDetailUrl(
      d.category?.slug.current,
      d.slug.current,
      d.blogId,
      d.language
    )}`;
    const lastmod = new Date(d._updatedAt).toISOString();
    return `
        <url>
          <loc>${loc}</loc>
          <lastmod>${lastmod}</lastmod>
          <changefreq>${changeFrequency}</changefreq>
          <priority>${priority}</priority>
        </url>
      `;
  });
