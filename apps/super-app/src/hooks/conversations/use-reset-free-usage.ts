import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import type { RefObject } from "react";

import { showToastSuccess } from "@/components/toaster";
import { RESET_USAGE_TOAST_OPTIONS } from "@/config/options";
import { usageClientService } from "@/core/repositories";
import { useMutation } from "@/libs/react-query";
import { MAX_FREE_USAGE_CHAT } from "@/store/global/initialization-hooks/free-usage.constants";
import type { TCreateGlobalStore } from "@/store/global/store";
import { THttpError } from "@/utils/commons/error";

import { getFreeUsageResetInfoQueryKey } from "./use-free-usage-reset-info";

export function useResetFreeUsage(store: RefObject<TCreateGlobalStore | null>) {
  const queryClient = useQueryClient();
  const conversationPageT = useTranslations("conversationPage");

  return useMutation({
    mutationFn: async () => {
      const [error, result] = await usageClientService.resetFreeUsage();

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    onError: () => {
      // Intentionally a no-op: errors are silently ignored for this mutation.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatFreeUsage"] });
      queryClient.invalidateQueries({
        queryKey: getFreeUsageResetInfoQueryKey(),
      });

      if (store.current) {
        store.current.getState().setChatFreeUsage({
          ...store.current.getState().chatFreeUsage,
          chat: MAX_FREE_USAGE_CHAT,
        });
      }

      // Only called when user has used usage after 24h → show "already reset" toast
      const config = RESET_USAGE_TOAST_OPTIONS.default;
      showToastSuccess(conversationPageT(config.descKey), {
        title: conversationPageT(config.titleKey),
      });
    },
  });
}
