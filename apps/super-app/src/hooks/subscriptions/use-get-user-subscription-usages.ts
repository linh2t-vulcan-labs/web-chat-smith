import { orderClientService } from "@/core/repositories";
import { useQuery } from "@/libs/react-query";

const getUserSubscriptionUsagesQueryKey = "useGetUserSubscriptionUsages";

const useGetUserSubscriptionUsages = (enabled?: boolean) =>
  useQuery({
    enabled: !!enabled,
    queryFn: async () => await orderClientService.getUserOrderTrialUsages(),
    queryKey: [getUserSubscriptionUsagesQueryKey, enabled],
  });

export { useGetUserSubscriptionUsages };
