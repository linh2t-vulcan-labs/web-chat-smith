import { getRuntimeEnv } from "@cs/env/universal";

import type { THttp } from "@/core/models/http";
import { MessageFeedbackResponseModel } from "@/core/models/message-feedback";
import type { TMessageFeedbackServiceAPIs } from "@/core/ports/message-feedback";
import { TransformerBuilder } from "@/libs/class-transformer";

const getSmithEngineServiceUrl = () =>
  getRuntimeEnv().CS_PUBLIC_SMITH_ENGINE_SERVICE_URL;

export const messageFeedbackServiceApis = (
  client: THttp
): TMessageFeedbackServiceAPIs => ({
  createFeedback: async (input, additionalInfo) => {
    const [error, result] = await client.post<MessageFeedbackResponseModel>(
      `/api/v1/users/web/conversations/${additionalInfo.conversationId}/messages/${additionalInfo.messageId}/feedback`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: input,
        enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(MessageFeedbackResponseModel)
      .format(result)
      .toPlainCamelCase() as MessageFeedbackResponseModel;

    return [null, data];
  },
  createFeedbackV2: async (input, additionalInfo) => {
    const [error, result] = await client.post<MessageFeedbackResponseModel>(
      `/api/v2/users/web/conversations/${additionalInfo.conversationId}/messages/${additionalInfo.messageId}/feedback`,
      {
        baseURL: getSmithEngineServiceUrl(),
        body: input,
        enabledFlattenData: true,
      }
    );

    if (error) {
      return [error, null];
    }

    const data = new TransformerBuilder(MessageFeedbackResponseModel)
      .format(result)
      .toPlainCamelCase() as MessageFeedbackResponseModel;

    return [null, data];
  },
});
