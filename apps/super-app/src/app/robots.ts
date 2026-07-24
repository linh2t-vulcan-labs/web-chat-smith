import { publicEnv } from "@cs/env/server";
import type { MetadataRoute } from "next";

const BASE_WEB_URL = "";

const WEB_URL = publicEnv.CS_PUBLIC_WEB_URL || BASE_WEB_URL;

export default function robots(): MetadataRoute.Robots {
  // Next.js automatically creates /sitemap.xml as the sitemap index
  // when using sitemap.ts with generateSitemaps()
  // The sitemap index will automatically reference all child sitemaps
  // (/sitemap/0.xml, /sitemap/1.xml, etc.)
  const sitemapUrls = [
    `${WEB_URL}/sitemap.xml`, // Main sitemap index (includes all dynamic sitemaps)
  ];

  return {
    rules: [
      {
        allow: ["/static/", "/public/"],
        disallow: ["/admin/", "/search/", "/graphql/"],
        userAgent: "*",
      },
    ],
    sitemap: sitemapUrls,
  };
}
