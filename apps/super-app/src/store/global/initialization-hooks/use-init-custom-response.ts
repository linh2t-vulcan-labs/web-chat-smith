import { useTranslations } from "next-intl";
import type { RefObject } from "react";
import { useEffect, useRef } from "react";

import { conversationClientService } from "@/core/repositories";
import { useQuery } from "@/libs/react-query";
import { defaultMCustomResponses } from "@/utils/constants/conversation";

import type { TCreateGlobalStore } from "../store";

export const useInitCustomResponse = (
  store: RefObject<TCreateGlobalStore | null>,
  isAuthenticated: boolean
) => {
  const customResponseT = useTranslations("conversationPage.customResponse");
  const hasInitializedRef = useRef(false);
  const { data: customResponseData } = useQuery({
    enabled: isAuthenticated,
    queryFn: async () => await conversationClientService.getCustomResponse(),
    queryKey: ["customResponses"],
    select(data) {
      const [error, result] = data;

      if (error) {
        return [];
      }

      return {
        ...result,
        prompts: result.prompts.map((item) => {
          const typeKey = item.type.toLowerCase();
          return {
            ...item,
            description: customResponseT(`${typeKey}.description`),
            preview: customResponseT(`${typeKey}.preview`),
            title: customResponseT(`${typeKey}.title`),
          };
        }),
      };
    },
  });

  useEffect(() => {
    if (hasInitializedRef.current || !store.current || !customResponseData) {
      return;
    }

    const customResponse = customResponseData ?? defaultMCustomResponses;

    store.current
      .getState()
      .setCustomResponses(
        Array.isArray(customResponse) ? [] : customResponse?.prompts || []
      );
    store.current
      .getState()
      .setSelectedCustomResponse(
        Array.isArray(customResponse)
          ? null
          : customResponse?.currentChoicePromptType || null
      );
    hasInitializedRef.current = true;
  }, [customResponseData, store]);
};
