import { useCallback, useMemo } from "react";

import type { NotificationModel } from "@/core/models/notification";
import { useGetNotifications } from "@/hooks/notifications/use-get-notifications";
import usePaginatedResultItems from "@/hooks/use-paginated-result-items";
import { useGlobalState } from "@/store/global/hooks";

interface TUseLoadNotificationReturn {
  loading: boolean;
  items: NotificationModel[];
  hasNextPage: boolean;
  error: boolean;
  loadMore: () => void;
  refetch: () => void;
}

interface TUseLoadNotificationProps {
  shouldFetch: boolean;
}

export function useLoadNotification({
  shouldFetch,
}: TUseLoadNotificationProps): TUseLoadNotificationReturn {
  const userId = useGlobalState((state) => state.user.id);
  const { data, hasNextPage, isLoading, isError, refetch, fetchNextPage } =
    useGetNotifications(Boolean(userId) && shouldFetch);
  const threadsFlattenData = usePaginatedResultItems(data, (page) => page.data);

  // Filter out duplicate notifications by ID
  const filteredItems = useMemo(() => {
    const seenIds = new Set<string>();
    return threadsFlattenData.filter((notification) => {
      if (seenIds.has(notification.id)) {
        return false; // Skip duplicate
      }
      seenIds.add(notification.id);
      return true;
    });
  }, [threadsFlattenData]);

  const loadMore = useCallback(() => {
    if (isLoading || !hasNextPage) {
      return;
    }
    fetchNextPage();
  }, [isLoading, hasNextPage, fetchNextPage]);

  return {
    error: isError,
    hasNextPage,
    items: filteredItems,
    loadMore,
    loading: isLoading,
    refetch,
  };
}
