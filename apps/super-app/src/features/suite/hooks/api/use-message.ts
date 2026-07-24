import { suiteCreativeMessageClientService } from "@/features/suite/services/design-studio/message-service";
import type {
  TSuiteCreativeDeleteMessageInput,
  // TSuiteCreativeGetMessageSuggestionsInput,
  TSuiteCreativeMessageHistoryQueryInput,
  TSuiteCreativePostMessageInput,
} from "@/features/suite/types/design-studio";
import {
  useInfiniteQuery,
  useMutation,
  // useQuery,
  useQueryClient,
} from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { suiteCreativeQueryKeys } from "./query-keys";

export const useGetMessageHistory = (
  input: TSuiteCreativeMessageHistoryQueryInput
) =>
  useInfiniteQuery({
    enabled: !!input.projectId,
    getNextPageParam: (lastPage) => lastPage?.nextPageToken || undefined,
    initialPageParam: null as string | null,
    networkMode: "always",
    queryFn: async ({ pageParam }) => {
      const [error, result] =
        await suiteCreativeMessageClientService.getMessageHistory({
          ...input,
          pageToken: pageParam,
        });

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    queryKey: suiteCreativeQueryKeys.messageHistory(input.projectId),
  });

// const useGetMessageSuggestions = (
//   input: TSuiteCreativeGetMessageSuggestionsInput
// ) =>
//   useQuery({
//     queryKey: suiteCreativeQueryKeys.messageSuggestions(
//       input.projectId,
//       input.messageId
//     ),
//     networkMode: "always",
//     queryFn: async () => {
//       const [error, result] =
//         await suiteCreativeMessageClientService.getMessageSuggestions(input);

//       if (error) {
//         throw new THttpError(error);
//       }

//       return result;
//     },
//     enabled: !!input.projectId && !!input.messageId,
//   });

export const usePostMessage = () =>
  useMutation({
    // Fail immediately when offline instead of pausing indefinitely (React Query default).
    networkMode: "always",
    mutationFn: async (input: TSuiteCreativePostMessageInput) => {
      const [error, result] =
        // oxlint-disable-next-line unicorn/require-post-message-target-origin
        await suiteCreativeMessageClientService.postMessage(input);

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
  });

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TSuiteCreativeDeleteMessageInput) => {
      const [error, result] =
        await suiteCreativeMessageClientService.deleteMessage(input);

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    networkMode: "always",
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: suiteCreativeQueryKeys.messageHistory(variables.projectId),
      });
    },
  });
};
