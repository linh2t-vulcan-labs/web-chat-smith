import { env } from "@cs/env";
import { unstable_cache } from "next/cache";

import { safeSanityFetchWithFallback } from "@/libs/sanity";
import type { AiGroupConfig, AiSeo } from "@/libs/sanity/sanity.types";

import {
  buildAiGroupConfigDocumentId,
  getGroupIdFromSegment,
} from "../constants/groups";
import type { AiToolGroupSegment } from "../constants/groups";
import { AI_GROUP_CONFIG_QUERY } from "./queries";

/** `aiGroupConfig` from GROQ with `seo` dereferenced for metadata. */
export type AiGroupConfigDocument = Omit<AiGroupConfig, "seo"> & {
  seo?: AiSeo | null;
};

/** Group landing copy from Sanity (`aiGroupConfig` keyed by `_id` or `groupId`). */
export const getAiGroupConfig = unstable_cache(
  async (group: AiToolGroupSegment): Promise<AiGroupConfigDocument | null> => {
    const groupId = getGroupIdFromSegment(group);
    if (!groupId) {
      return null;
    }

    const configId = buildAiGroupConfigDocumentId(groupId);

    const doc = await safeSanityFetchWithFallback<AiGroupConfigDocument | null>(
      AI_GROUP_CONFIG_QUERY,
      null,
      { configId, groupId },
      {
        next: {
          revalidate: env.SANITY_REVALIDATE_TIME,
          tags: ["ai-group-config", `ai-group-config:${group}`],
        },
      }
    );

    if (process.env.NODE_ENV === "development" && doc === null) {
      console.warn("[getAiGroupConfig] No document matched:", {
        configId,
        dataset: env.SANITY_DATASET || "(empty)",
        group,
        groupId,
      });
    }

    return doc;
  },
  ["ai-group-config-v3"],
  {
    revalidate: env.SANITY_REVALIDATE_TIME,
    tags: ["ai-group-config"],
  }
);
