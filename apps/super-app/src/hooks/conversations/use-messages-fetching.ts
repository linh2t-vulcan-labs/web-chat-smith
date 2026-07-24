import { useTranslations } from "next-intl";
import { useCallback, useEffect } from "react";
import { toast } from "sonner";

import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { useConversationModelSync } from "@/hooks/conversations/use-conversation-model-sync";
import { useDeleteConversation } from "@/hooks/conversations/use-delete-conversation";
import { useHandleGetMessagesFromConversationId } from "@/hooks/conversations/use-get-messages";
import { useRouter } from "@/i18n/navigation";
import { useConversationState } from "@/store/conversation/hooks";
import { defaultConversationState } from "@/utils/constants/conversation";
import { CONVERSATION_URL } from "@/utils/constants/url";

import { useConversationTracing } from "./use-conversation-tracing";

const DEFAULT_LIMIT_MESSAGES = 50;
function useMessagesFetching({ id }: { id?: string }) {
  const commonT = useTranslations("common");
  const conversationT = useTranslations("conversationPage");
  // Global state
  const router = useRouter();
  // Chat sync
  const { isBeta: enabledChatSync, isReady } = useChatSyncFlag();
  // Conversation State
  const selectedId = useConversationState((state) => state.selectedId);
  const conversationStates = useConversationState(
    (state) => state.conversationStates
  );
  const setConversationStates = useConversationState(
    (state) => state.setConversationStates
  );
  const checkDisabledInputBasedOnMessageStatus = useConversationState(
    (state) => state.checkDisabledInputBasedOnMessageStatus
  );
  const resetConversationStore = useConversationState(
    (state) => state.resetStore
  );

  const conversationId = id ?? selectedId;
  const conversation =
    conversationStates[conversationId] || defaultConversationState;

  // Hook for tracing conversation
  const { startTracing, stopTracing } = useConversationTracing();

  const handleSuccess = () => {
    toast.error(null, {
      description: conversationT("toast.error.unableFindConversation"),
    });

    router.push(CONVERSATION_URL);
    resetConversationStore({ selectedId: "" });
  };

  const deleteConversationMutation = useDeleteConversation({
    onSuccess: handleSuccess,
  });
  const {
    isLoading,
    isError: isFetchMessageError,
    hasNextPage,
    isFetchingNextPage,
    originalData,
    refetchMessages,
    fetchNextPageConversation,
    conversationInfo,
    isLoadingConversation,
    isErrorConversation,
    isFetched,
    isFetchNextPageError,
  } = useHandleGetMessagesFromConversationId({
    id,
    limit: DEFAULT_LIMIT_MESSAGES,
    sortBy: "SORT_DESC",
  });

  // Sync selected model with conversation's last used model (only when isBeta/enabledChatSync = true)
  useConversationModelSync({
    conversationId,
    conversationInfo,
    isBeta: enabledChatSync,
  });

  const wrappedFetchNextPage = useCallback(async () => {
    const { data } = await fetchNextPageConversation();

    if (!data) {
      return;
    }

    const additionalMessages = data.pages
      .slice(1) // Skip the first page
      .flatMap((page) => page.data)
      .toReversed();

    const originalMessages = (data.pages[0]?.data ?? []).toReversed();
    const updatedMessages = [...additionalMessages, ...originalMessages];

    setConversationStates(conversationId, {
      messages: updatedMessages,
    });
  }, [conversationId, fetchNextPageConversation, setConversationStates]);

  useEffect(() => {
    if (!conversationId || conversation?.messages?.length > 0 || !isReady) {
      return;
    }
    if (isLoading) {
      return;
    }

    if (isFetchMessageError) {
      toast.error(conversationT("toast.error.failConversation"), {
        description: conversationT("toast.error.tryAgain"),
      });

      return;
    }

    setConversationStates(conversationId, {
      messages: originalData,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, conversationId, originalData]);

  const longPollingProcessId = conversationInfo?.longPollingProcess?.processId;

  useEffect(() => {
    if (!conversationId || !isReady || isLoading) {
      return;
    }
    if (!longPollingProcessId) {
      return;
    }

    startTracing(conversationInfo, originalData, enabledChatSync);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- see comment above
  }, [
    conversationId,
    isReady,
    isLoading,
    longPollingProcessId,
    enabledChatSync,
    startTracing,
  ]);

  useEffect(() => {
    const isDataReady =
      !isLoading &&
      !isLoadingConversation &&
      isFetched &&
      !!conversationId &&
      conversationInfo;

    if (!isDataReady || isFetchMessageError) {
      return;
    }

    const messages = conversation?.messages || [];
    const isMessageProcessing = messages.some(
      (msg) => msg.status === "pending"
    );

    // Just mutate delete if chat sync not enable
    if (enabledChatSync || isMessageProcessing) {
      return;
    }

    const isEmptyConversation = originalData.length === 0;
    const isOnlyUserAndErrorMessage = messages.length === 2;
    const hasOnlyInvalidMessages = checkDisabledInputBasedOnMessageStatus();
    const isFailedConversation =
      isOnlyUserAndErrorMessage && hasOnlyInvalidMessages;

    if (isEmptyConversation || isFailedConversation) {
      deleteConversationMutation.mutate({ id: conversationId });
    }
  }, [
    isLoading,
    isLoadingConversation,
    originalData,
    isFetchMessageError,
    conversationInfo,
    enabledChatSync,
    isFetched,
    deleteConversationMutation,
    conversationId,
    conversation?.messages,
    checkDisabledInputBasedOnMessageStatus,
  ]);

  useEffect(() => {
    if (!isLoadingConversation && isErrorConversation) {
      setTimeout(() => {
        toast.error(commonT("toast.error.unableFindConversation"), {
          description: conversationT("toast.error.notExistConversation"),
        });
        router.push(CONVERSATION_URL);
      }, 200);
    }
  }, [
    isLoadingConversation,
    isErrorConversation,
    commonT,
    conversationT,
    router,
  ]);

  return {
    conversationInfo,
    fetchNextPageConversation: wrappedFetchNextPage,
    hasNextPage,
    isFetchMessageError,
    isFetchNextPageError,
    isFetchedMessages: isFetched,
    isFetchingNextPage,
    isLoading: isLoading || deleteConversationMutation.isPending,
    isLoadingConversation,
    messages: conversation?.messages,
    refetchMessages,
    stopTracing,
  };
}

export default useMessagesFetching;
