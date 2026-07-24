"use client";

import { useCallback, useEffect, useState } from "react";

import type { AIModelItem } from "@/core/models/model";
import { defaultChatModel } from "@/store/conversation/constants";

import { useAiToolBannerModels } from "./use-ai-tool-banner-models";

export function useAiToolBannerModelSelection() {
  const models = useAiToolBannerModels();

  const [selectedModel, setSelectedModel] =
    useState<AIModelItem>(defaultChatModel);
  const [seenChatModels, setSeenChatModels] = useState<AIModelItem[]>([]);

  useEffect(() => {
    if (!models.length) {
      return;
    }

    const match = models
      .flatMap((provider) => provider.models)
      .find((m) => m.value === selectedModel.value);
    if (match) {
      // oxlint-disable-next-line react/react-compiler -- resyncs selected model when the available models list changes (e.g. after remote config loads), external-data-driven not a render derivation
      setSelectedModel(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models]);

  const handleSelectModel = useCallback(
    (model: AIModelItem) => {
      if (model.value === selectedModel.value) {
        return;
      }

      const isModelSeen = seenChatModels.some(
        (seenModel) =>
          seenModel.value === model.value &&
          seenModel.badge?.text === model.badge?.text
      );
      if (!isModelSeen) {
        setSeenChatModels((prev) => [...prev, model]);
      }

      setSelectedModel(model);
    },
    [seenChatModels, selectedModel.value]
  );

  return {
    handleSelectModel,
    models,
    seenChatModels,
    selectedModel,
  };
}

export type AiToolBannerModelSelection = ReturnType<
  typeof useAiToolBannerModelSelection
>;
