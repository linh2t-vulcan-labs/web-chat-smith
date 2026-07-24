import { z } from "@cs/validation";

import { defineService } from "../../endpoints/registry";

const NotificationSchema = z.object({
  content: z.string(),
  createdAt: z.string(),
  id: z.string(),
  imageUrl: z.optional(z.string()),
  read: z.boolean(),
  title: z.string(),
  userId: z.optional(z.string()),
});

const NotificationListSchema = z.object({
  nextPageToken: z.string(),
  notifications: z.array(NotificationSchema),
});

// Confirmed against apps/super-app/src/config/notification.ts
// (PUSH_TOKEN_PLATFORM.WEB) — lowercase, not "WEB".
const PUSH_PLATFORM_WEB = "web";

/**
 * `notification` is the one service whose path doesn't follow the default
 * "/{service}/api/{version}" convention — no `/api` prefix at all (see
 * docs/runbook/api-client.md §2 smell #11 and §8 escape-hatch example).
 */
export const notification = defineService("notification", {
  pathPrefix: "/notifications",
})
  .endpoint("getList", {
    auth: "required",
    method: "GET",
    path: "/v1/notifications/get-list",
    responseSchema: NotificationListSchema,
    toQuery: (input: { pageSize: number; pageToken?: string | number }) =>
      input,
  })
  .endpoint("getUnreadCount", {
    auth: "required",
    method: "GET",
    path: "/v1/notifications/unread-count",
    responseSchema: z.object({ unreadCount: z.number() }),
  })
  .endpoint("markAllAsRead", {
    auth: "required",
    method: "POST",
    path: "/v1/notifications/mark-all-as-read",
    responseSchema: z.object({ markedCount: z.number(), message: z.string() }),
    toBody: () => ({}),
  })
  .endpoint("markAsRead", {
    auth: "required",
    method: "POST",
    path: "/v1/notifications/mark-as-read",
    toBody: (input: { notificationIds: string[]; userId: string }) => ({
      notificationIds: input.notificationIds,
      readFromTime: Date.now(),
      userId: input.userId,
    }),
  })
  .endpoint("registerPushToken", {
    auth: "required",
    method: "POST",
    path: "/v1/push-tokens",
    responseSchema: z.object({ message: z.string() }),
    retry: false,
    toBody: (input: { pushToken: string }) => ({
      platform: PUSH_PLATFORM_WEB,
      pushToken: input.pushToken,
    }),
  })
  .endpoint("unregisterPushToken", {
    auth: "required",
    method: "POST",
    path: "/v1/push-tokens/unregister",
    responseSchema: z.object({ message: z.string() }),
    retry: false,
    toBody: (input: { pushToken: string }) => ({
      platform: PUSH_PLATFORM_WEB,
      pushToken: input.pushToken,
    }),
  });
