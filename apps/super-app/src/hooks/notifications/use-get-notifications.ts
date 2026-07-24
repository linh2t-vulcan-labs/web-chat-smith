import { notificationService } from "@/core/repositories";
import { useInfiniteQuery } from "@/libs/react-query";
import {
  MILLISECONDS_IN_A_SECOND,
  SECONDS_IN_A_MINUTE,
} from "@/utils/commons/date-time";
import { THttpError } from "@/utils/commons/error";

const NOTIFICATIONS_LIMIT = "8";
const NOTIFICATIONS_PAGE = "1";
const NOTIFICATIONS_INTERVAL_30_MIN =
  MILLISECONDS_IN_A_SECOND * SECONDS_IN_A_MINUTE * 60 * 30;

export function getNotificationsQueryKey() {
  return ["notifications"];
}

export function useGetNotifications(shouldFetch = false) {
  return useInfiniteQuery({
    enabled: shouldFetch,
    getNextPageParam: (lastPage) => lastPage.next_page_token || undefined,
    initialPageParam: NOTIFICATIONS_PAGE,
    networkMode: "always",
    queryFn: async ({ pageParam }) => {
      const params = {
        limit: NOTIFICATIONS_LIMIT,
        page_token: pageParam,
      };
      const [error, notifications] =
        await notificationService.getNotifications(params);

      if (error) {
        throw new THttpError(error);
      }
      return notifications;
    },
    queryKey: getNotificationsQueryKey(),
    refetchInterval: NOTIFICATIONS_INTERVAL_30_MIN,
  });
}
