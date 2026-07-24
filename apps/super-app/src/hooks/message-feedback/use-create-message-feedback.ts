import type { TCreateMessageFeedbackInput } from "@/core/models/message-feedback";
import { messageFeedbackClientService } from "@/core/repositories";
import { messageFeedbackUC } from "@/core/usecases";
import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

export const useCreateMessageFeedback = () =>
  useMutation({
    mutationFn: async (input: TCreateMessageFeedbackInput) => {
      const dto = messageFeedbackUC.transformToMessageFeedbackDto(input);
      return await messageFeedbackClientService.createFeedbackV2(dto, {
        conversationId: input.conversationId,
        messageId: input.messageId,
      });
    },
    mutationKey: ["useCreateMessageFeedback"],
    onError: (error) => error,
    onSuccess: (data) => {
      const [error, response] = data;

      if (error) {
        throw new THttpError(error);
      }

      return response;
    },
  });
