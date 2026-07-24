import { env } from "@cs/env";
import { unstable_cache } from "next/cache";

import { routing } from "@/i18n/routing";
import { safeSanityFetchWithFallback } from "@/libs/sanity";

import { getGroupIdFromSegment } from "../constants/groups";
import type { AiToolGroupSegment } from "../constants/groups";
import { normalizeAIToolLocale } from "../translations/config";
import { AI_TOOL_PAGE_LOCALES_QUERY } from "./queries";

function normalizePublishedLocales(
  locales: (string | null | undefined)[]
): string[] {
  const supported = new Set<string>(routing.locales);
  const unique = new Set<string>();

  for (const locale of locales) {
    if (!locale) {
      continue;
    }
    const normalized = normalizeAIToolLocale(locale);
    if (supported.has(normalized)) {
      unique.add(normalized);
    }
  }

  return [...unique];
}

export const getAiToolPageLocales = unstable_cache(
  async (group: AiToolGroupSegment, slug: string): Promise<string[]> => {
    const groupId = getGroupIdFromSegment(group);
    if (!groupId) {
      return [];
    }

    const locales = await safeSanityFetchWithFallback<(string | null)[]>(
      AI_TOOL_PAGE_LOCALES_QUERY,
      [],
      { groupId, slug },
      {
        next: {
          revalidate: env.SANITY_REVALIDATE_TIME,
          tags: ["ai-tool-page-locales", `ai-tool-page:${group}:${slug}`],
        },
      }
    );

    const normalized = normalizePublishedLocales(locales);
    return normalized.length > 0 ? normalized : [...routing.locales];
  },
  ["ai-tool-page-locales"],
  {
    revalidate: env.SANITY_REVALIDATE_TIME,
    tags: ["ai-tool-page-locales"],
  }
);
