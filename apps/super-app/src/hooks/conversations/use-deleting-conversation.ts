import { useIsMutating } from "@tanstack/react-query";

import { useGlobalState } from "@/store/global/hooks";

import { getDeleteConversationQueryKey } from "./use-delete-conversation";

export function useDeletingConversation() {
  const isDeletingConversation = useGlobalState(
    (state) => state.isDeletingConversation
  );
  const isMutating = useIsMutating({
    mutationKey: getDeleteConversationQueryKey(),
  });
  return {
    checkDeletingConversation: (conversationId: string) =>
      isDeletingConversation(conversationId) && isMutating > 0,
  };
}
