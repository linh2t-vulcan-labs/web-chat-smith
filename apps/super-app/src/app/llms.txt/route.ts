import { NextResponse } from "next/server";

import { LLMS_TXT_CONFIG_QUERY, safeSanityFetch } from "@/libs/sanity";
import type { LlmsTxtConfig } from "@/libs/sanity/sanity.types";

export const revalidate = 3600; // Revalidate hourly

type LlmsTxtConfigResult = Pick<LlmsTxtConfig, "content">;

export async function GET() {
  const { data } = await safeSanityFetch<LlmsTxtConfigResult>(
    LLMS_TXT_CONFIG_QUERY,
    {},
    { next: { revalidate, tags: ["llmsTxtConfig"] } }
  );

  const content = data?.content?.trim();

  if (!content) {
    return new NextResponse("Not found", {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      status: 404,
    });
  }

  return new NextResponse(content, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
