import { useQueryClient } from "@tanstack/react-query";

import type {
  TAssistantWriting,
  TUpdateAssistantWritingByIdInput,
} from "@/core/models/assistant-writing";
import { assistantWritingClientService } from "@/core/repositories";
import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { getConversationsQueryKey } from "../conversations/use-get-conversations";
import { getAssistantWritingQueryKey } from "./use-get-assistant-writing";

export function useUpdateAssistantWriting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TUpdateAssistantWritingByIdInput) => {
      const [error, assistantWriting] =
        await assistantWritingClientService.updateAssistantWritingById(input);

      if (error) {
        throw new THttpError(error);
      }

      queryClient.setQueryData<TAssistantWriting>(
        getAssistantWritingQueryKey(input.id),
        {
          answer: assistantWriting,
          settings: input.settings,
          status: "idle",
        }
      );

      return assistantWriting;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getConversationsQueryKey(),
      });
    },
  });
}
