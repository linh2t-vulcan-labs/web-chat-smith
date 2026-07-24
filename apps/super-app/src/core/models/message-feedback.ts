import { Expose } from "@/libs/class-transformer";

export enum EMessageFeedbackOptionType {
  RESEARCH = "research", // use for deep research and web search
  IMAGE_CREATION = "image_creation", // text to image and image to image
  NORMAL = "normal", // normal chat
  COMMON = "common",
}
export enum EMessageFeedbackStatus {
  UNSPECIFIED = "FEEDBACK_STATUS_UNSPECIFIED",
  LIKE = "FEEDBACK_STATUS_LIKE",
  DISLIKE = "FEEDBACK_STATUS_DISLIKE",
}

export interface TMessageFeedbackOption {
  id: string;
  type: EMessageFeedbackOptionType;
  content: string;
}

export interface TCreateMessageFeedbackInput {
  conversationId: string;
  messageId: string;
  status: EMessageFeedbackStatus;
  reason?: string[];
  detail?: string;
  readSource?: string;
}

export class MessageFeedbackResponseModel {
  @Expose()
  reason: string[] = [];

  @Expose()
  detail = "";

  @Expose()
  status!: EMessageFeedbackStatus;
}
