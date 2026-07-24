import { useTranslations } from "next-intl";
import type { RefObject } from "react";
import { useEffect, useRef } from "react";

import { conversationClientService } from "@/core/repositories";
import { useQuery } from "@/libs/react-query";
import { defaultModels } from "@/utils/constants/conversation";

import type { TCreateGlobalStore } from "../store";

const PROVIDER_ORDER = ["openai", "gemini", "deepseek", "claude", "grok"];

export const useInitModels = (store: RefObject<TCreateGlobalStore | null>) => {
  const conversationT = useTranslations("conversationPage");
  const hasInitializedRef = useRef(false);
  const { data: modelsResponse } = useQuery({
    queryFn: async () => await conversationClientService.getModels(),
    queryKey: ["models"],
    select(data) {
      const [error, result] = data;

      if (error) {
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
        models: model.models.map((item) => {
          const descKey = `${item.value}.desc`;
          return {
            ...item,
            // Backend may return models with no translation key yet — fall back
            // to the existing description instead of throwing on a missing message.
            description: conversationT.has(descKey)
              ? conversationT(descKey)
              : (item.description ?? ""),
          };
        }),
      }));
    },
  });

  useEffect(() => {
    if (hasInitializedRef.current || !store.current || !modelsResponse) {
      return;
    }

    const aiModels = modelsResponse ?? defaultModels;
    store.current.getState().setModels(aiModels);
    hasInitializedRef.current = true;
  }, [modelsResponse, store]);
};
