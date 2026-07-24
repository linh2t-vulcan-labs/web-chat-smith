import type { TMessageTemp } from "@/core/models/conversation";
import { EAIValueModel } from "@/core/models/model";
import { conversationClientService } from "@/core/repositories";
import { conversationUC } from "@/core/usecases";
import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

interface TCreatePredictionQuery {
  messages: TMessageTemp[];
  promptTemplate: string;
  model: EAIValueModel;
}

export function useCreatePrediction() {
  return useMutation({
    mutationFn: async (input: TCreatePredictionQuery) => {
      const userMessage = conversationUC.createTempMessage({
        model: input.model,
        prompt: input.promptTemplate,
        role: "user",
        type: "chat",
      });
      const messagesDto = conversationUC.transformMessageBeforeSend(
        [...input.messages, userMessage],
        {
          model: EAIValueModel.GPT4o_Mini,
        }
      );

      const [error, result] =
        await conversationClientService.createPrediction(messagesDto);

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
  });
}
