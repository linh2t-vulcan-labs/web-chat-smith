import type { TMessageTemp } from "@/core/models/conversation";

export interface TMessageItemProps {
  className?: string;
  isLastMessage?: boolean;
  isConversationGenerating: boolean;
  message: TMessageTemp;
  onRegenerateMessage?: () => Promise<void>;
  isNewMessage: boolean;
}
