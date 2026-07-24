import { Exclude, Expose } from "@/libs/class-transformer";

@Exclude()
export class NotificationModel {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  content!: string;

  @Expose({ name: "user_id" })
  userId?: string;

  @Expose({ name: "image_url" })
  imageUrl?: string;

  @Expose()
  link!: string;

  @Expose({ name: "created_at" })
  createdAt!: string;

  @Expose()
  read!: boolean;
}

export interface TResponseGetNotifications {
  next_page_token: string;
  data: NotificationModel[];
}

export interface TResponsePushToken {
  message: string;
}

export interface TResponseMarkAllAsRead {
  message: string;
  marked_count: number;
}

export interface TResponseGetUnreadCount {
  unread_count: number;
}
export interface TMarkAsReadInput {
  userId: string;
  notificationIds: string[];
}
