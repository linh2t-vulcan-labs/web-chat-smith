import type {
  NotificationModel,
  TMarkAsReadInput,
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

// Helper function to mark notifications as read
function markNotificationAsRead(
  notification: NotificationModel,
  notificationIds: string[]
) {
  if (notificationIds.includes(notification.id)) {
    return {
      ...notification,
      read: true,
    };
  }
  return notification;
}

// Helper function to update page data with read notifications
function updatePageWithReadNotifications(
  page: TResponseGetNotifications,
  notificationIds: string[]
) {
  return {
    ...page,
    data: page.data.map((notification) =>
      markNotificationAsRead(notification, notificationIds)
    ),
  };
}

// Helper function to update cached notification data
function updateNotificationsCache(
  oldData: IPaginatedNotificationsData | undefined,
  notificationIds: string[]
): IPaginatedNotificationsData | undefined {
  if (!oldData?.pages) {
    return oldData;
  }

  return {
    ...oldData,
    pages: oldData.pages.map((page: TResponseGetNotifications) =>
      updatePageWithReadNotifications(page, notificationIds)
    ),
  };
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TMarkAsReadInput) => {
      const [error, notification] = await notificationService.markAsRead(input);

      if (error) {
        throw new THttpError(error);
      }

      return notification;
    },
    onError: (error: Error) => error,
    onSuccess: (_data, variables) => {
      // Update the cache to set read = true for the notification IDs
      queryClient.setQueryData(
        getNotificationsQueryKey(),
        (oldData: IPaginatedNotificationsData | undefined) =>
          updateNotificationsCache(oldData, variables.notificationIds)
      );

      // Update unread count by decrementing 1
      const unreadCountData = queryClient.getQueryData<TResponseGetUnreadCount>(
        getUnreadCountQueryKey()
      );

      if (unreadCountData && unreadCountData.unread_count > 0) {
        queryClient.setQueryData(getUnreadCountQueryKey(), {
          ...unreadCountData,
          unread_count: unreadCountData.unread_count - 1,
        });
      }
    },
  });
}
