import { env } from "@cs/env";
import { unstable_cache } from "next/cache";

import { safeSanityFetchWithFallback } from "@/libs/sanity";
import { buildSanityImageUrlWithPreset } from "@/libs/sanity/image-url";
import type {
  AiToolPreview,
  AiToolSectionImage,
} from "@/libs/sanity/sanity.types";

import {
  buildAiToolPagePath,
  getSegmentFromGroupId,
} from "../constants/groups";
import type { AiToolGroupId, AiToolGroupSegment } from "../constants/groups";
import { formatAiToolSlugToDisplayName } from "../utils";
import { MORE_RESOURCE_AI_TOOLS_QUERY } from "./queries";

interface MoreResourceAiToolRow {
  _id: string;
  slug: string;
  groupId: string;
  preview?: AiToolPreview | null;
}

export interface MoreResourceAiToolCard {
  id: string;
  slug: string;
  group: AiToolGroupSegment;
  title: string;
  description: string;
  imageUrl: string | null;
  /** Path for `next-intl` `Link` (no locale prefix). */
  href: string;
}

function resolvePreviewImageUrl(
  image: AiToolSectionImage | null | undefined
): Promise<string | null> {
  if (!image) {
    return Promise.resolve(null);
  }
  return buildSanityImageUrlWithPreset(image, "aiToolMoreResource");
}

function rowToCard(
  row: MoreResourceAiToolRow
): Omit<MoreResourceAiToolCard, "imageUrl"> | null {
  const slug = row.slug?.trim();
  const group = getSegmentFromGroupId(row.groupId?.trim() ?? "");
  if (!slug || !group) {
    return null;
  }

  const { preview } = row;
  const title =
    preview?.preview_title?.trim() || formatAiToolSlugToDisplayName(slug);
  const description = preview?.preview_description?.trim() ?? "";

  return {
    description,
    group,
    href: buildAiToolPagePath(group, slug),
    id: row._id,
    slug,
    title,
  };
}

async function mapRowsToCards(
  rows: MoreResourceAiToolRow[]
): Promise<MoreResourceAiToolCard[]> {
  const cards = await Promise.all(
    rows.map(async (row) => {
      const base = rowToCard(row);
      if (!base) {
        return null;
      }
      const imageUrl = await resolvePreviewImageUrl(row.preview?.image);
      return { ...base, imageUrl };
    })
  );

  return cards.filter((c): c is MoreResourceAiToolCard => c !== null);
}

export interface GetMoreResourceAiToolsOptions {
  language: string;
  groupIds: AiToolGroupId[];
  /** Omit the current page from the list. */
  exclude?: { group: AiToolGroupSegment; slug: string };
}

const getMoreResourceAiToolsCached = unstable_cache(
  async (
    language: string,
    groupIdsKey: string,
    excludeGroup: string,
    excludeSlug: string
  ): Promise<MoreResourceAiToolCard[]> => {
    const groupIds = groupIdsKey
      ? (JSON.parse(groupIdsKey) as AiToolGroupId[])
      : [];
    if (!groupIds.length) {
      return [];
    }

    const rows = await safeSanityFetchWithFallback<MoreResourceAiToolRow[]>(
      MORE_RESOURCE_AI_TOOLS_QUERY,
      [],
      { groupIds, lang: language },
      {
        next: {
          revalidate: env.SANITY_REVALIDATE_TIME,
          tags: [
            "ai-tool-page",
            "more-resource-ai-tools",
            `more-resource-ai-tools:${language}`,
          ],
        },
      }
    );

    const exclude =
      excludeGroup && excludeSlug
        ? { group: excludeGroup as AiToolGroupSegment, slug: excludeSlug }
        : undefined;

    const filtered = exclude
      ? rows.filter((row) => {
          const group = getSegmentFromGroupId(row.groupId?.trim() ?? "");
          const slug = row.slug?.trim();
          if (!group || !slug) {
            return true;
          }
          return !(group === exclude.group && slug === exclude.slug);
        })
      : rows;

    return mapRowsToCards(filtered);
  },
  ["more-resource-ai-tools"],
  {
    revalidate: env.SANITY_REVALIDATE_TIME,
    tags: ["more-resource-ai-tools"],
  }
);

/** Linked `aiTool` resources for {@link MoreResourceAITool} (locale + `linkAiTool.groupIds`). */
export function getMoreResourceAiTools({
  language,
  groupIds,
  exclude,
}: GetMoreResourceAiToolsOptions): Promise<MoreResourceAiToolCard[]> {
  const uniqueGroupIds = [...new Set(groupIds.filter(Boolean))];
  const groupIdsKey = JSON.stringify(uniqueGroupIds);
  return getMoreResourceAiToolsCached(
    language,
    groupIdsKey,
    exclude?.group ?? "",
    exclude?.slug ?? ""
  );
}
