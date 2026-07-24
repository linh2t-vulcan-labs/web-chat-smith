"use client";

import { useEffect } from "react";

import { userUC } from "@/core/usecases";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { DEFAULT_NOTIFICATION_CONFIG } from "@/libs/firebase/remote-config-default";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { useGlobalState } from "@/store/global/hooks";
import { toUnixMs } from "@/utils/commons/date-time";
import { safeJsonParse } from "@/utils/commons/helpers";

import { E_PERMISSION_REQUEST_TYPE } from "../enum/permission";
import type { TNotificationContext } from "../provider/types";
import type { TNotificationConfig } from "../types/common";
import { isNotificationAPIAvailable } from "../utils/helpers";

type TPermissionReminderDeps = Pick<
  TNotificationContext,
  "hasClosedPopup" | "setConfirmToastState" | "checkShownNewUserSoftPerm"
>;

export function usePermissionReminder({
  hasClosedPopup,
  setConfirmToastState,
  checkShownNewUserSoftPerm,
}: TPermissionReminderDeps) {
  const userCreatedAt = useGlobalState((state) => state.user.createdAt);
  const { getValueSyncRemoteConfig, isReady } = useRemoteConfigContext();

  const raw = getValueSyncRemoteConfig(REMOTE_CONFIG_KEY.NOTIFICATION_CONFIG);
  const notificationConfig =
    safeJsonParse<TNotificationConfig>(raw) || DEFAULT_NOTIFICATION_CONFIG;

  useEffect(() => {
    if (!isReady || !isNotificationAPIAvailable()) {
      return;
    }
    const currentPermission = globalThis.Notification.permission;
    if (currentPermission !== "default") {
      return;
    }
    if (!userCreatedAt) {
      return;
    }
    if (!hasClosedPopup) {
      return;
    }

    const thresholdDays = notificationConfig.newUserThresholdDays;
    const { newUserRetryMs } = notificationConfig;
    // Default show soft notification permission if thresholdDays not exist
    const shouldTriggerSoftPerm = thresholdDays
      ? userUC.checkIsNewUser(userCreatedAt, thresholdDays)
      : true;
    if (!shouldTriggerSoftPerm) {
      return;
    }
    if (checkShownNewUserSoftPerm()) {
      return;
    }
    const firstLoginMs = toUnixMs(userCreatedAt);
    const isReturningNewUser = Date.now() - firstLoginMs >= newUserRetryMs;
    if (isReturningNewUser) {
      setConfirmToastState(
        true,
        E_PERMISSION_REQUEST_TYPE.NOTIFICATION_BASE_PERMISSION,
        {
          fromNewUser: true,
          triggerName: "2nd_session",
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    setConfirmToastState,
    checkShownNewUserSoftPerm,
    userCreatedAt,
    isReady,
    notificationConfig.newUserThresholdDays,
    notificationConfig.newUserRetryMs,
  ]);

  return null;
}
