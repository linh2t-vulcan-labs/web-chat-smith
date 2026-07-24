import { publicEnv } from "@cs/env/server";
import { NextResponse } from "next/server";

import { generateSitemaps } from "@/utils/sitemap";

// Forces request-time execution instead of a build-time static prerender —
// this route calls Sanity (via generateSitemaps), and super-app builds once
// and deploys the same image everywhere ("build once, deploy many"), so
// SANITY_* must be readable at runtime, not baked in as a build arg. The
// explicit Cache-Control header below already provides the caching that
// `revalidate` used to (CDN/edge caches the response for 1h), so this trades
// nothing functionally.
export const dynamic = "force-dynamic";

const WEB_URL = publicEnv.CS_PUBLIC_WEB_URL || "";

export async function GET() {
  // Get all sitemap IDs from generateSitemaps
  const sitemaps = await generateSitemaps();

  // Generate sitemap index XML
  // Next.js creates sitemaps at /sitemap/[id].xml when using generateSitemaps()
  const sitemapEntries = sitemaps
    .map((sitemap) => {
      const lastmod = new Date().toISOString();
      return `
    <sitemap>
      <loc>${WEB_URL}/sitemap/${sitemap.id}.xml</loc>
      <lastmod>${lastmod}</lastmod>
    </sitemap>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries}
</sitemapindex>`.trim();

  return new NextResponse(xml, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
      "Content-Type": "application/xml",
    },
  });
}
