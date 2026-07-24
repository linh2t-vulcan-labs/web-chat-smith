export interface TGetNotificationInput {
  page_token?: number | string;
  limit: number | string;
}

export interface TNotificationDTO {
  id: string;
  user_id: string;
  read: boolean;
  created_at: string;
  title: string;
  content: string;
  image_url: string;
}

export interface TGetNotificationDto {
  next_page_token: string;
  notifications: TNotificationDTO[];
}

export interface TGetUnreadCountDto {
  unread_count: number;
}
