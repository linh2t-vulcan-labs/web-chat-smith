export type NotificationPermissionState =
  | "default"
  | "denied"
  | "granted"
  | "unsupported";

const isSupported = (): boolean =>
  typeof window !== "undefined" && "Notification" in window;

export const getPermissionState = (): NotificationPermissionState =>
  isSupported() ? Notification.permission : "unsupported";

export const requestPermission =
  async (): Promise<NotificationPermissionState> => {
    if (!isSupported()) {
      return "unsupported";
    }
    return await Notification.requestPermission();
  };
