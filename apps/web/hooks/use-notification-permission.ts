import type { NotificationPermissionState } from "@cs/notifications/permission";
import { NotificationsContext } from "@cs/notifications/react";
import { useContext } from "react";

export interface UseNotificationPermissionResult {
  permissionState: NotificationPermissionState;
  /** No-ops until `NotificationsProvider` has actually mounted its context. */
  requestPermission: () => Promise<void>;
}

/**
 * Entry point for any future UI (a settings toggle, an "Enable
 * notifications" banner) that needs to trigger the browser's
 * notification-permission prompt and start syncing the FCM token.
 *
 * Reads the context directly instead of `@cs/notifications/react`'s
 * `useNotifications()` (which throws when unmounted) because
 * `components/providers/notifications-provider.tsx` legitimately renders
 * without mounting the context provider — both when `CS_PUBLIC_FIREBASE_VAPID_KEY`
 * is unset and during the brief `isInitializing` window on first render,
 * before `useApiAuth()`'s restore effect resolves. Callers render
 * unconditionally without needing to know about that window.
 */
export const useNotificationPermission =
  (): UseNotificationPermissionResult => {
    const value = useContext(NotificationsContext);

    return {
      permissionState: value?.permissionState ?? "default",
      requestPermission: async () => {
        await value?.requestPermission();
      },
    };
  };
