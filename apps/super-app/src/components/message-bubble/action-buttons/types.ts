import type { TReadSourceDTO } from "@/core/http/dto/conversation";
import type { TMessageTemp } from "@/core/models/conversation";

export interface TFeedbackButtonProps {
  tooltip: string;
  type: "like" | "dislike";
  conversationId: string;
  message: TMessageTemp;
  readSource: TReadSourceDTO;
}
