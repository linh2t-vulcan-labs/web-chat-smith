export interface TNotificationContentProps {
  isMobile?: boolean;
  onMarkAllAsReadSuccess?: () => void;
  onNotificationClick?: (shouldClose: boolean) => void;
}
