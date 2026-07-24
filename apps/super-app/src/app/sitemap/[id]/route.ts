import { publicEnv } from "@cs/env/server";
import type { SanityDocument } from "next-sanity";
import { NextResponse } from "next/server";

import { routing } from "@/i18n/routing";
import type {
  TSanityAiToolPageSitemap,
  TSanityBlog,
  TSanityPolicy,
  TTotalBlogResponse,
} from "@/libs/sanity";
import {
  getSanityServerClient,
  SITEMAP_AI_TOOL_PAGES_QUERY,
  SITEMAP_BLOGS_QUERY,
  SITEMAP_POLICY_QUERY,
  TOTAL_BLOGS_QUERY,
} from "@/libs/sanity";
import {
  BLOGS_PER_SITEMAP,
  getAiToolPageSitemaps,
  getBlogsListingSitemaps,
  getBlogsSitemaps,
  getFaqSitemaps,
  getPricingSitemaps,
  getStaticSitemaps,
} from "@/utils/sitemap";

type TBlogFetchResponse = SanityDocument & {
  blogs: TSanityBlog[];
  total: number;
};

const BASE_WEB_URL = "";

const WEB_URL = publicEnv.CS_PUBLIC_WEB_URL || BASE_WEB_URL;

export async function GET(
  _req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params;
  const idNum = Number(id);

  const client = await getSanityServerClient();

  const totalBlogsResult =
    await client.fetch<TTotalBlogResponse>(TOTAL_BLOGS_QUERY);
  const totalBlogs = totalBlogsResult.total || 0;

  // Calculate the number of sitemaps needed
  const totalSitemaps = Math.ceil(totalBlogs / BLOGS_PER_SITEMAP);

  if (Number(id) >= totalSitemaps || !Number.isFinite(idNum)) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const start = idNum * BLOGS_PER_SITEMAP;
  const end = start + BLOGS_PER_SITEMAP;

  const result = await client.fetch<TBlogFetchResponse>(SITEMAP_BLOGS_QUERY, {
    end,
    start,
  });

  const blogSiteMap = getBlogsSitemaps({
    baseUrl: WEB_URL,
    changeFrequency: "daily",
    data: result.blogs,
    priority: 1,
  });

  let xmlUrls: string[] = [];
  // Add static pages, policies, FAQ, and AI tool images to the first sitemap (id: 0)
  if (idNum === 0) {
    const policyData = await client.fetch<TSanityPolicy[]>(
      SITEMAP_POLICY_QUERY,
      {
        lang: routing.defaultLocale,
      }
    );

    const aiToolPages = await client.fetch<TSanityAiToolPageSitemap[]>(
      SITEMAP_AI_TOOL_PAGES_QUERY
    );

    let policyUrls: string[] = [];
    const staticUrls = [
      {
        lastModified: new Date("2025-07-25").toISOString(),
        priority: 1,
        url: WEB_URL,
      },
      {
        lastModified: new Date("2025-07-25").toISOString(),
        priority: 0.8,
        url: `${WEB_URL}/faq`,
      },
    ];
    if (policyData.length > 0) {
      policyUrls = getStaticSitemaps(
        policyData.map((p) => ({
          lastModified: new Date(p._updatedAt).toISOString(),
          priority: 0.8,
          url: `${WEB_URL}/${p.slug}`,
        }))
      );
    }
    const faqUrls = getFaqSitemaps(WEB_URL);
    const landingLastModified = new Date("2025-07-25").toISOString();
    const pricingUrls = getPricingSitemaps({
      baseUrl: WEB_URL,
      lastModified: landingLastModified,
      priority: 0.9,
    });
    const blogsListingUrls = getBlogsListingSitemaps({
      baseUrl: WEB_URL,
      lastModified: landingLastModified,
      priority: 0.9,
    });
    const aiToolPageUrls = getAiToolPageSitemaps({
      baseUrl: WEB_URL,
      changeFrequency: "weekly",
      data: aiToolPages,
      priority: 0.9,
    });
    xmlUrls = [
      ...getStaticSitemaps(staticUrls),
      ...faqUrls,
      ...policyUrls,
      ...pricingUrls,
      ...blogsListingUrls,
      ...aiToolPageUrls,
      ...blogSiteMap,
    ];
  } else {
    xmlUrls = blogSiteMap;
  }
  const xmlItems = xmlUrls.join("");

  const xml = `
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${xmlItems}
    </urlset>
  `.trim();

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
    status: 200,
  });
}
