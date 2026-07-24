import { EConversationMode } from "@/core/models/conversation";

export const isValidConversationMode = (
  mode: string
): mode is EConversationMode =>
  Object.values(EConversationMode).includes(mode as EConversationMode);
