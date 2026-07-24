import { notification } from "@cs/api-client/services/notification";

/**
 * Wires `NotificationsProvider`'s `onToken`/token-removal hooks to the
 * backend contract that already exists in `@cs/api-client`
 * (`packages/api-client/src/services/notification/notification.ts`'s
 * `registerPushToken`/`unregisterPushToken`). Use these instead of
 * hand-rolling a second HTTP call against the same endpoints.
 *
 * @example
 * import { registerFcmTokenWithApiClient } from "@cs/notifications/integrations/api-client";
 * <NotificationsProvider onToken={registerFcmTokenWithApiClient} ... />
 */
export const registerFcmTokenWithApiClient = async (
  token: string
): Promise<void> => {
  await notification.registerPushToken({ pushToken: token });
};

export const unregisterFcmTokenWithApiClient = async (
  token: string
): Promise<void> => {
  await notification.unregisterPushToken({ pushToken: token });
};
