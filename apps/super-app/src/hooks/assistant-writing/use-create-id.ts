import { EUseCase } from "@/core/http/dto/conversation";
import { assistantWritingClientService } from "@/core/repositories";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

export function useCreateId() {
  const { isPersistenceEnabled } = useChatSyncFlag();

  return useMutation({
    mutationFn: async () => {
      const [error, assistantWriting] = isPersistenceEnabled
        ? await assistantWritingClientService.createAssistantWritingIdV2({
            use_case: EUseCase.ACADEMIC_WRITING,
          })
        : await assistantWritingClientService.createAssistantWritingId({
            use_case: EUseCase.ACADEMIC_WRITING,
          });

      if (error) {
        throw new THttpError(error);
      }

      return assistantWriting.id;
    },
  });
}
