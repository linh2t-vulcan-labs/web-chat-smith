import { suiteCreativeQuotaClientService } from "@/features/suite/services/design-studio/quota-service";
import { useQuery } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { suiteCreativeQueryKeys } from "./query-keys";

// Shared so an imperative pre-send check (queryClient.fetchQuery) and the hook use one definition.
export const quotaQueryOptions = {
  networkMode: "always" as const,
  queryFn: async () => {
    const [error, result] = await suiteCreativeQuotaClientService.getQuota();

    if (error) {
      throw new THttpError(error);
    }

    return result;
  },
  queryKey: suiteCreativeQueryKeys.quota(),
};

export const useGetQuota = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({ ...quotaQueryOptions, enabled });
