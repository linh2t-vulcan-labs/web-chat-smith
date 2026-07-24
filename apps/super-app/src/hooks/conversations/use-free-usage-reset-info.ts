import { useQuery } from "@tanstack/react-query";

import { usageClientService } from "@/core/repositories";
import { THttpError } from "@/utils/commons/error";

export const getFreeUsageResetInfoQueryKey = () => ["freeUsageResetInfo"];

export function useFreeUsageResetInfo(isAuthenticated: boolean) {
  return useQuery({
    enabled: isAuthenticated,
    queryFn: async () => {
      const [error, result] = await usageClientService.getFreeUsageResetInfo();

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    queryKey: getFreeUsageResetInfoQueryKey(),
  });
}
