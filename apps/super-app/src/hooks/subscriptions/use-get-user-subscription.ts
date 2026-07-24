import { subscriptionClientService } from "@/core/repositories";
import { useQuery } from "@/libs/react-query";

const getUserSubscriptionQueryKey = "useGetUserSubscriptions";
const useGetUserSubscription = (enabled?: boolean) =>
  useQuery({
    enabled: !!enabled,
    queryFn: async () => await subscriptionClientService.getUserSubscriptions(),
    queryKey: [getUserSubscriptionQueryKey, enabled],
  });

export { getUserSubscriptionQueryKey, useGetUserSubscription };
