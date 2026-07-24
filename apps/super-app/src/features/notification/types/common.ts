export interface TConfirmToastOptions {
  title?: string;
  description?: string;
  fromNewUser?: boolean;
  triggerName?: string;
}

export interface TNotificationConfig {
  newUserThresholdDays: number;
  newUserRetryMs: number;
  popupDelayMs: number;
}

export interface TNotificationStore {
  recentRequestTime: string;
  shownNewUserSoftPerm: boolean;
}

export interface MessageData {
  messageId: string;
  data?: {
    link?: string;
    title?: string;
    body?: string;
    image?: string;
  };
  notification?: {
    title?: string;
    body?: string;
    image?: string;
  };
}

export interface TRequestPermissionOptions {
  fromWhatsNew?: boolean;
  fromOnboarding?: boolean;
}
