"use client";

import { useTranslations } from "next-intl";

import type { AIModel } from "@/core/models/model";
import { conversationClientService } from "@/core/repositories";
import { useQuery } from "@/libs/react-query";

const PROVIDER_ORDER = ["openai", "gemini", "deepseek", "claude", "grok"];

/** Fetches chat models for the AI tool banner (same source as conversation `useInitModels`). */
export function useAiToolBannerModels(): AIModel[] {
  const conversationT = useTranslations("conversationPage");

  const { data: models = [] } = useQuery({
    queryFn: () => conversationClientService.getModels(),
    queryKey: ["ai-tool-banner-models"],
    select(data) {
      const [error, result] = data;
      if (error || !result?.length) {
        return [];
      }

      const sorted = [...result].toSorted((a, b) => {
        const aIdx = PROVIDER_ORDER.indexOf(a.value);
        const bIdx = PROVIDER_ORDER.indexOf(b.value);
        return (
          (aIdx === -1 ? PROVIDER_ORDER.length : aIdx) -
          (bIdx === -1 ? PROVIDER_ORDER.length : bIdx)
        );
      });

      return sorted.map((model) => ({
        ...model,
        models: model.models.map((item) => ({
          ...item,
          description: conversationT(`${item.value}.desc`),
        })),
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  return models;
}
