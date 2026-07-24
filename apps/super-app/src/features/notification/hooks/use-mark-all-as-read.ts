import type {
  TResponseGetNotifications,
  TResponseGetUnreadCount,
} from "@/core/models/notification";
import { notificationService } from "@/core/repositories";
import { getNotificationsQueryKey } from "@/hooks/notifications/use-get-notifications";
import { useMutation, useQueryClient } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { getUnreadCountQueryKey } from "./use-get-unread-count";

// Interface for paginated notifications data
interface IPaginatedNotificationsData {
  pages: TResponseGetNotifications[];
}

// Helper function to mark all notifications in a page as read
function markAllNotificationsInPageAsRead(page: TResponseGetNotifications) {
  return {
    ...page,
    data: page.data.map((notification) => ({
      ...notification,
      read: true,
    })),
  };
}

// Helper function to update all pages with read notifications
function updateAllPagesAsRead(
  oldData: IPaginatedNotificationsData | undefined
): IPaginatedNotificationsData | undefined {
  if (!oldData?.pages) {
    return oldData;
  }

  return {
    ...oldData,
    pages: oldData.pages.map((page) => markAllNotificationsInPageAsRead(page)),
  };
}

// Helper function to reset unread count to zero
function resetUnreadCountToZero(oldData: TResponseGetUnreadCount | undefined) {
  if (!oldData) {
    return oldData;
  }

  return {
    ...oldData,
    unread_count: 0,
  };
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const [error, result] = await notificationService.markAllAsRead();

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    onError: (error: Error) => error,
    onSuccess: () => {
      // Update the cache to set read = true for all notifications
      queryClient.setQueryData(
        getNotificationsQueryKey(),
        (oldData: IPaginatedNotificationsData | undefined) =>
          updateAllPagesAsRead(oldData)
      );

      // Update unread count to 0
      queryClient.setQueryData(
        getUnreadCountQueryKey(),
        resetUnreadCountToZero
      );
    },
  });
}
