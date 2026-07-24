import { env } from "@cs/env";
import { unstable_cache } from "next/cache";

import { safeSanityFetchWithFallback } from "@/libs/sanity";

import { getSegmentFromGroupId } from "../constants/groups";
import { AI_TOOL_STATIC_PARAMS_QUERY } from "./queries";

export interface AiToolStaticParam {
  group: string;
  slug: string;
}

interface AiToolStaticParamsRow {
  slug: string;
  groupId?: string | null;
}

/** Published `aiTool` rows for `generateStaticParams` on `/[group]/[slug]`. */
export const getAiToolStaticParams = unstable_cache(
  async (): Promise<AiToolStaticParam[]> => {
    const rows = await safeSanityFetchWithFallback<AiToolStaticParamsRow[]>(
      AI_TOOL_STATIC_PARAMS_QUERY,
      [],
      {},
      {
        next: {
          revalidate: env.SANITY_REVALIDATE_TIME,
          tags: ["ai-tool-page"],
        },
      }
    );

    const params: AiToolStaticParam[] = [];
    const seen = new Set<string>();

    for (const row of rows) {
      const slug = row.slug?.trim();
      const groupId = row.groupId?.trim();
      if (!slug || !groupId) {
        continue;
      }

      const group = getSegmentFromGroupId(groupId);
      if (!group) {
        continue;
      }

      const key = `${group}:${slug}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      params.push({ group, slug });
    }

    return params;
  },
  ["ai-tool-static-params"],
  {
    revalidate: env.SANITY_REVALIDATE_TIME,
    tags: ["ai-tool-page"],
  }
);
