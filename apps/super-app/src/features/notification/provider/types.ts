import type { Dispatch, SetStateAction } from "react";

import type { NotificationModel } from "@/core/models/notification";

import type { E_PERMISSION_REQUEST_TYPE } from "../enum/permission";
import type {
  TConfirmToastOptions,
  TRequestPermissionOptions,
} from "../types/common";

export interface TNotificationContext {
  notifications: NotificationModel[];
  loading: boolean;
  hasNextPage: boolean;
  error: boolean;
  loadMore: () => void;
  permission: NotificationPermission | null;
  canRequestPermission: boolean;
  setPermission: (permission: NotificationPermission | null) => void;
  hasPermission: boolean;
  requestPermissionAndGetToken: (
    options?: TRequestPermissionOptions
  ) => Promise<NotificationPermission>;
  isLoading: boolean;
  shouldFetchNotifications: boolean;
  enableNotificationFetch: () => void;
  reloadNotifications: () => void;
  refetchUnreadCount: () => void;
  setConfirmToastState: (
    enable: boolean,
    type?: E_PERMISSION_REQUEST_TYPE,
    options?: TConfirmToastOptions
  ) => void;
  deleteFirebasePushToken: () => void;
  clearNotificationStorage: () => void;
  unregisterPushToken: (
    pushToken: string,
    clearStorage: boolean
  ) => Promise<boolean>;
  isBrowserSupported: () => boolean;
  checkShownNewUserSoftPerm: () => boolean;
  canShowSoftPermission: () => boolean;
  initNotificationLocalStore: () => void;
  setHasClosedPopup: Dispatch<SetStateAction<boolean>>;
  hasClosedPopup: boolean;
  firebasePushToken: string;
  unReadCount: number;
}
