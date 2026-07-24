import type { NotificationModel } from "@/core/models/notification";

export interface TNotificationItemProps {
  active?: boolean;
  icon?: string;
  title: string;
  description: string;
  time: string;
}

export interface TNotificationListProps {
  isOnline?: boolean;
  onNotificationClick?: (item: NotificationModel) => void;
}
