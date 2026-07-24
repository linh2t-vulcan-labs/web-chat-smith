import type { TMessageFeedbackChipOption } from "@/components/message-feedback-modal/types";
import type {
  CreateMessageFeedbackDTO,
  TCreateMessageFeedbackAdditionalInfoDTO,
} from "@/core/http/dto/message-feedback";
import type { TMessageType } from "@/core/models/conversation";
import type {
  EMessageFeedbackOptionType,
  MessageFeedbackResponseModel,
  TCreateMessageFeedbackInput,
  TMessageFeedbackOption,
} from "@/core/models/message-feedback";

import type { TResult } from "../models/http";

export interface TMessageFeedbackRepositories {
  getMessageFeedbackTypeFromMessageType: (
    messageType: TMessageType
  ) => EMessageFeedbackOptionType[];
  extractFeedbackOptionsToChipOptions: (
    options: TMessageFeedbackOption[]
  ) => TMessageFeedbackChipOption[];
  transformToMessageFeedbackDto: (
    input: TCreateMessageFeedbackInput
  ) => CreateMessageFeedbackDTO;
  transformToMessageFeedbackV2Dto: (
    input: TCreateMessageFeedbackInput
  ) => CreateMessageFeedbackDTO;
}

export interface TMessageFeedbackServiceAPIs {
  createFeedback: (
    input: CreateMessageFeedbackDTO,
    additionalInfo: TCreateMessageFeedbackAdditionalInfoDTO
  ) => TResult<MessageFeedbackResponseModel>;
  createFeedbackV2: (
    input: CreateMessageFeedbackDTO,
    additionalInfo: TCreateMessageFeedbackAdditionalInfoDTO
  ) => TResult<MessageFeedbackResponseModel>;
}
