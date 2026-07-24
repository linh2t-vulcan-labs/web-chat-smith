export interface TMessageMarkdownProps {
  content: string;
  onBadgeClick?: (badgeContent: string) => void;
  conversationId?: string;
  messageId?: string;
}
