import type { TMessageTemp } from "@/core/models/conversation";

export interface TMessageItemProps {
  className?: string;
  isLastMessage?: boolean;
  isNewMessage?: boolean;
  isConversationGenerating: boolean;
  message: TMessageTemp;
  onRegenerateMessage?: () => Promise<void>;
}
