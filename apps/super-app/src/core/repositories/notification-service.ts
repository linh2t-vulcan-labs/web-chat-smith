import { getRuntimeEnv } from "@cs/env/universal";

import { PUSH_TOKEN_PLATFORM } from "@/config/notification";
import type { THttp } from "@/core/models/http";
import type {
  TMarkAsReadInput,
  TResponseMarkAllAsRead,
  TResponsePushToken,
} from "@/core/models/notification";
import { NotificationModel } from "@/core/models/notification";
import type { TNotificationServiceAPIs } from "@/core/ports/notification";
import { TransformerBuilder } from "@/libs/class-transformer";
import { DEFAULT_PAGINATION } from "@/utils/constants/common";

import type {
  TGetNotificationDto,
  TGetNotificationInput,
  TGetUnreadCountDto,
} from "../http/dto/notification";

const getNotificationServiceUrl = () =>
  `${getRuntimeEnv().CS_PUBLIC_API_BASE_URL}/notifications`;

export const notificationServiceAPIs = (
  client: THttp
): TNotificationServiceAPIs => ({
  getNotifications: async (input: TGetNotificationInput) => {
    const [error, result] = await client.get<TGetNotificationDto>(
      `/v1/notifications/get-list`,
      {
        baseURL: getNotificationServiceUrl(),
        params: {
          page_size: input.limit || DEFAULT_PAGINATION.LIMIT,
          ...(input.page_token !== "1" && { page_token: input.page_token }),
        },
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(NotificationModel)
      .format(result.notifications)
      .toPlainCamelCase() as NotificationModel[];
    const transform = {
      ...result,
      data,
    };
    return [null, transform];
  },
  getUnreadCount: async () => {
    const [error, result] = await client.get<TGetUnreadCountDto>(
      `/v1/notifications/unread-count`,
      {
        baseURL: getNotificationServiceUrl(),
      }
    );

    if (error) {
      return [error, null];
    }
    return [null, result];
  },
  markAllAsRead: async () => {
    const [error, result] = await client.post<TResponseMarkAllAsRead>(
      `/v1/notifications/mark-all-as-read`,
      {
        baseURL: getNotificationServiceUrl(),
        body: {},
      }
    );

    if (error) {
      return [error, null];
    }
    return [null, result];
  },
  markAsRead: async (input: TMarkAsReadInput) => {
    const payload = {
      notification_ids: input.notificationIds,
      read_from_time: Date.now(),
      user_id: input.userId,
    };

    const [error, result] = await client.post<object>(
      `/v1/notifications/mark-as-read`,
      {
        baseURL: getNotificationServiceUrl(),
        body: payload,
      }
    );

    if (error) {
      return [error, null];
    }
    return [null, result];
  },
  registerFCMToken: async (token: string) => {
    const payload = {
      platform: PUSH_TOKEN_PLATFORM.WEB,
      push_token: token,
    };

    const [error, result] = await client.post<TResponsePushToken>(
      `/v1/push-tokens`,
      {
        baseURL: getNotificationServiceUrl(),
        body: payload,
      }
    );

    if (error) {
      return [error, null];
    }
    return [null, result];
  },
  unregisterPushToken: async (token: string) => {
    const payload = {
      platform: PUSH_TOKEN_PLATFORM.WEB,
      push_token: token,
    };

    const [error, result] = await client.post<TResponsePushToken>(
      `/v1/push-tokens/unregister`,
      {
        baseURL: getNotificationServiceUrl(),
        body: payload,
      }
    );

    if (error) {
      return [error, null];
    }
    return [null, result];
  },
});
