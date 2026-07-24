import type { EMessageFeedbackStatus } from "@/core/models/message-feedback";
import { Expose } from "@/libs/class-transformer";

export interface TCreateMessageFeedbackAdditionalInfoDTO {
  conversationId: string;
  messageId: string;
}

export class CreateMessageFeedbackDTO {
  @Expose()
  reason?: string[];

  @Expose()
  detail?: string;

  @Expose()
  status!: EMessageFeedbackStatus;

  @Expose()
  readSource?: string;
}
