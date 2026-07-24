import type { EConversationMode } from "@/core/models/conversation";

export interface TConversationMain {
  id?: string;
  isHome?: boolean;
}

export interface TSendMessageOptions {
  userInput: string;
  mode: EConversationMode;
}
