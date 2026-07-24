import type { TMessageFeedbackChipOption } from "@/components/message-feedback-modal/types";
import { CreateMessageFeedbackDTO } from "@/core/http/dto/message-feedback";
import type { TMessageFeedbackOption } from "@/core/models/message-feedback";
import { EMessageFeedbackOptionType } from "@/core/models/message-feedback";
import type { TMessageFeedbackRepositories } from "@/core/ports/message-feedback";
import { TransformerBuilder } from "@/libs/class-transformer";
import { generateRandomUUIDV4 } from "@/utils/commons/helpers";

const getMessageFeedbackTypeFromMessageType: TMessageFeedbackRepositories["getMessageFeedbackTypeFromMessageType"] =
  (messageType): EMessageFeedbackOptionType[] => {
    switch (messageType) {
      case "image_creation": {
        return [
          EMessageFeedbackOptionType.IMAGE_CREATION,
          EMessageFeedbackOptionType.COMMON,
        ];
      }
      case "deep_research_analyze":
      case "deep_research":
      case "realtime_search": {
        return [
          EMessageFeedbackOptionType.RESEARCH,
          EMessageFeedbackOptionType.COMMON,
        ];
      }
      default: {
        return [
          EMessageFeedbackOptionType.NORMAL,
          EMessageFeedbackOptionType.COMMON,
        ];
      }
    }
  };

const extractFeedbackOptionsToChipOptions: TMessageFeedbackRepositories["extractFeedbackOptionsToChipOptions"] =
  (options: TMessageFeedbackOption[]) =>
    options.flatMap((option) =>
      option.content.split(",").map((item) => ({
        content: item.trim(),
        id: generateRandomUUIDV4(),
      }))
    ) as TMessageFeedbackChipOption[];

const transformToMessageFeedbackDto: TMessageFeedbackRepositories["transformToMessageFeedbackDto"] =
  (input) =>
    new TransformerBuilder(CreateMessageFeedbackDTO)
      .format(input, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as CreateMessageFeedbackDTO;

const transformToMessageFeedbackV2Dto: TMessageFeedbackRepositories["transformToMessageFeedbackV2Dto"] =
  (input) =>
    // V2 DTO includes readSource field alongside status, reason, and detail
    new TransformerBuilder(CreateMessageFeedbackDTO)
      .format(input, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as CreateMessageFeedbackDTO;

export const messageFeedbackUseCases = (): TMessageFeedbackRepositories => ({
  extractFeedbackOptionsToChipOptions,
  getMessageFeedbackTypeFromMessageType,
  transformToMessageFeedbackDto,
  transformToMessageFeedbackV2Dto,
});
