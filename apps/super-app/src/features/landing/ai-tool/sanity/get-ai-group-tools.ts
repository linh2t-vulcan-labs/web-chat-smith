import { env } from "@cs/env";
import { unstable_cache } from "next/cache";

import { safeSanityFetchWithFallback } from "@/libs/sanity";

import {
  buildAiToolPagePath,
  getGroupIdFromSegment,
} from "../constants/groups";
import type { AiToolGroupSegment } from "../constants/groups";
import { formatAiToolSlugToDisplayName } from "../utils";
import { AI_GROUP_TOOLS_QUERY } from "./queries";

interface AiGroupToolRow {
  _id: string;
  title?: string | null;
  slug?: string | null;
}

export interface AiGroupToolCard {
  id: string;
  title: string;
  /** Path for `next-intl` `Link` (no locale prefix). */
  href: string;
}

function rowToCard(
  row: AiGroupToolRow,
  group: AiToolGroupSegment
): AiGroupToolCard | null {
  const slug = row.slug?.trim();
  if (!slug) {
    return null;
  }

  const title = row.title?.trim() || formatAiToolSlugToDisplayName(slug);

  return {
    href: buildAiToolPagePath(group, slug),
    id: row._id,
    title,
  };
}

/** Published `aiTool` cards for a group landing page (locale + group segment). */
export const getAiGroupTools = unstable_cache(
  async (
    language: string,
    group: AiToolGroupSegment
  ): Promise<AiGroupToolCard[]> => {
    const groupId = getGroupIdFromSegment(group);
    if (!groupId) {
      return [];
    }

    const rows = await safeSanityFetchWithFallback<AiGroupToolRow[]>(
      AI_GROUP_TOOLS_QUERY,
      [],
      { groupId, lang: language },
      {
        next: {
          revalidate: env.SANITY_REVALIDATE_TIME,
          tags: [
            "ai-group-tools",
            `ai-group-tools:${group}`,
            `ai-group-tools:${language}`,
          ],
        },
      }
    );

    return rows
      .map((row) => rowToCard(row, group))
      .filter((card): card is AiGroupToolCard => card !== null);
  },
  ["ai-group-tools"],
  {
    revalidate: env.SANITY_REVALIDATE_TIME,
    tags: ["ai-group-tools"],
  }
);
