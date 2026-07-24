import type { TGetNotificationInput } from "@/core/http/dto/notification";

import type { TResult } from "../models/http";
import type {
  TMarkAsReadInput,
  TResponseGetNotifications,
  TResponseGetUnreadCount,
  TResponseMarkAllAsRead,
  TResponsePushToken,
} from "../models/notification";

export interface TNotificationServiceAPIs {
  registerFCMToken: (token: string) => TResult<TResponsePushToken>;
  unregisterPushToken: (token: string) => TResult<TResponsePushToken>;
  getNotifications: (
    params: TGetNotificationInput
  ) => TResult<TResponseGetNotifications>;
  markAsRead: (input: TMarkAsReadInput) => TResult<object>;
  markAllAsRead: () => TResult<TResponseMarkAllAsRead>;
  getUnreadCount: () => TResult<TResponseGetUnreadCount>;
}

export interface TNotificationRepositories {
  registerFCMToken: (token: string) => TResult<TResponsePushToken>;
  unregisterPushToken: (token: string) => TResult<TResponsePushToken>;
  getNotifications: (
    params: TGetNotificationInput
  ) => TResult<TResponseGetNotifications>;
  markAsRead: (input: TMarkAsReadInput) => TResult<object>;
  markAllAsRead: () => TResult<TResponseMarkAllAsRead>;
  getUnreadCount: () => TResult<TResponseGetUnreadCount>;
}
