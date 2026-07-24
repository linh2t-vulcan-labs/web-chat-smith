import { readSuiteCreativeStream } from "@/features/suite/services/design-studio/stream-reader";
import { suiteCreativeStreamClientService } from "@/features/suite/services/design-studio/stream-service";
import type {
  TSuiteCreativeStreamMessageMutationInput,
  TSuiteCreativeStreamMessageMutationResult,
} from "@/features/suite/types/design-studio";
import { useMutation, useQueryClient } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

export const useStreamMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Fail immediately when offline instead of pausing indefinitely (React Query default).
    networkMode: "always",
    mutationFn: async (
      input: TSuiteCreativeStreamMessageMutationInput
    ): Promise<TSuiteCreativeStreamMessageMutationResult> => {
      let completed = false;
      let streamLastEventId: string | null = null;
      const response =
        await suiteCreativeStreamClientService.streamMessage(input);

      if (!response.ok) {
        throw new THttpError({
          error: response,
          message: response.statusText || "Creative Studio stream failed",
          status: response.status,
        });
      }

      const streamResult = await readSuiteCreativeStream(
        response,
        {
          ...input.handlers,
          "message.done": (payload, event) => {
            completed = true;
            input.handlers?.["message.done"]?.(payload, event);
          },
        },
        input.signal
      );
      streamLastEventId = streamResult.lastEventId;

      return { completed, lastEventId: streamLastEventId };
    },
    onSuccess: async (result) => {
      if (!result.completed) {
        return;
      }

      // Invalidate only project list + single project detail (key length <= 4).
      // Broader prefix matching would also hit messageHistory and projectImages,
      // causing unnecessary refetches — those are kept fresh by SSE events.
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey as unknown[];
          return (
            key[0] === "suite" &&
            key[1] === "creative" &&
            key[2] === "projects" &&
            key.length <= 4
          );
        },
      });
    },
  });
};
