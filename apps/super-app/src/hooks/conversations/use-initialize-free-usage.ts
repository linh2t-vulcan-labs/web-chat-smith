import { usageClientService } from "@/core/repositories";
import { useMutation, useQueryClient } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { getFreeUsageResetInfoQueryKey } from "./use-free-usage-reset-info";

export function useInitializeFreeUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const [error, result] = await usageClientService.initializeFreeUsage();

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    onError: (error) => {
      console.error("Initialize free usage error", { error });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chatFreeUsage"] });
      queryClient.invalidateQueries({
        queryKey: getFreeUsageResetInfoQueryKey(),
      });
    },
    retry: 3,
  });
}
