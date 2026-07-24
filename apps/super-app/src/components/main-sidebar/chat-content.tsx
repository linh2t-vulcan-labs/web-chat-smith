"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import { FetchingErrorMessage } from "@/components/fetching-error-message";
import Spinner from "@/components/spinner/spinner";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { showConfirm } from "@/features/confirmation-dialog/provider/confirmation-provider";
import { useDeleteConversation } from "@/hooks/conversations/use-delete-conversation";
import { useEditTitleConversation } from "@/hooks/conversations/use-edit-title-conversation";
import { useGetConversations } from "@/hooks/conversations/use-get-conversations";
import { useThreadBlurContent } from "@/hooks/threads/use-blur-content";
import { useInfiniteScrollObserver } from "@/hooks/use-infinite-scroll-observer";
import { useMediaQuery } from "@/hooks/use-media-query";
import usePaginatedResultItems from "@/hooks/use-paginated-result-items";
import { useRouter } from "@/i18n/navigation";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";
import { CONVERSATION_URL } from "@/utils/constants/url";

import ThreadList from "./thread-list";

interface Props {
  onToggleSidebar?: () => void;
  shouldFetch?: boolean;
}
const ChatContent: React.FC<Props & React.HTMLAttributes<HTMLDivElement>> = ({
  shouldFetch,
  className,
  onToggleSidebar,
}) => {
  const conversationT = useTranslations("conversationPage");
  const commonT = useTranslations("common");
  const router = useRouter();
  const isDesktop = useMediaQuery("md");
  const user = useGlobalState((state) => state.user);
  const addDeletingConversationId = useGlobalState(
    (state) => state.addDeletingConversationId
  );
  const removeDeletingConversationId = useGlobalState(
    (state) => state.removeDeletingConversationId
  );
  const { sendTrackingEvent } = useSendTrackingEvent();
  const { isReady, isBeta: enabledChatSync } = useChatSyncFlag();

  const {
    data,
    isLoading,
    isError,
    isFetching,
    isFetchingNextPage,
    isFetchNextPageError,
    hasNextPage,
    refetch: refetchConversations,
    fetchNextPage,
  } = useGetConversations({
    enabled: isReady && Boolean(shouldFetch),
    useChatSync: enabledChatSync,
  });

  const deleteThreadMutation = useDeleteConversation();
  const editThreadMutation = useEditTitleConversation();

  const { scrollRef, isScrollable, atBottom } = useThreadBlurContent();

  const loading = useMemo(
    () => isFetching || isFetchingNextPage,
    [isFetching, isFetchingNextPage]
  );

  const infiniteScrollRef = useInfiniteScrollObserver({
    enabled: !!user?.id,
    fn: fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    loading,
  });

  const selectedId = useConversationState((state) => state.selectedId);
  const resetConversationStore = useConversationState(
    (state) => state.resetStore
  );

  const threadsFlattenData = usePaginatedResultItems(data, (page) => page.data);
  const isShowBlurLayout =
    threadsFlattenData &&
    threadsFlattenData?.length > 0 &&
    isScrollable &&
    !isFetchNextPageError &&
    (!atBottom || hasNextPage);

  const handleClickConversation = (conversationId: string) => {
    if (!isDesktop) {
      onToggleSidebar?.();
    }
    resetConversationStore({ selectedId: conversationId });
    sendTrackingEvent({
      name: EventKeys.MainLeftSidebarConvSelect,
      payload: {
        conversation_id: conversationId,
        vulcan_user_id: user.id,
      },
    });
  };

  const handleEditConversation = (id: string, title: string) => {
    sendTrackingEvent({
      name: EventKeys.MainLeftSidebarConversationRename,
      payload: {
        conversation_id: id,
        vulcan_user_id: user.id,
      },
    });
    editThreadMutation.mutate({ id, name: title });

    if (editThreadMutation.error) {
      toast.error(null, {
        description: "Unable to update name of conversation",
      });
    }
  };

  const onDeleteConversation = async (id: string) => {
    try {
      addDeletingConversationId(id);
      await deleteThreadMutation.mutateAsync({ id });
      if (selectedId === id) {
        router.push(CONVERSATION_URL);
        resetConversationStore({ selectedId: "" });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch {
      toast.error(conversationT("toast.error.failDeleteConversation"), {
        description: conversationT("toast.error.tryAgainLater"),
      });
    } finally {
      removeDeletingConversationId(id);
    }
  };

  const handleDeleteConversation = async (id: string) => {
    sendTrackingEvent({
      name: EventKeys.MainLeftSidebarConversationDelete,
      payload: {
        conversation_id: id,
        vulcan_user_id: user.id,
      },
    });
    const confirmed = await showConfirm({
      cancelText: commonT("cta.cancel"),
      confirmText: commonT("cta.delete"),
      message: conversationT("modal.deleteConversation.desc"),
      title: conversationT("modal.deleteConversation.title"),
    });
    if (confirmed) {
      onDeleteConversation(id);
    }
  };

  useEffect(() => {
    if (isError) {
      toast.error(conversationT("toast.error.failHistory"), {
        description: conversationT("toast.error.tryAgain"),
      });
    }
  }, [isError, conversationT]);

  return (
    <div
      ref={scrollRef}
      className={compositeStyles(
        "static flex flex-1 flex-col overflow-y-auto",
        className
      )}
    >
      {isLoading || !isReady ? (
        <div className="flex size-full items-center justify-center">
          <Spinner size={30} />
        </div>
      ) : (
        <ThreadList
          id={selectedId}
          isError={isError}
          threads={threadsFlattenData || []}
          onClick={handleClickConversation}
          onRemove={handleDeleteConversation}
          onEdit={handleEditConversation}
          onRetry={refetchConversations}
        />
      )}

      {isFetchNextPageError && (
        <div className="flex flex-col">
          {isFetchingNextPage ? (
            <div className="py-small-1 pointer-events-none flex w-full items-center justify-center">
              <Spinner size={20} />
            </div>
          ) : (
            <div className="ps-medium-1.5">
              <FetchingErrorMessage
                size="small"
                align="left"
                text={commonT("cta.failLoadMoreHistory")}
                onRetry={fetchNextPage}
              />
            </div>
          )}
        </div>
      )}
      {hasNextPage && !isFetchNextPageError && (
        <div
          ref={infiniteScrollRef}
          className="py-small-0.75 pointer-events-none flex w-full items-center justify-center"
        >
          {isFetching && <Spinner size={20} />}
        </div>
      )}
      {isShowBlurLayout && (
        <div
          className="from-v1-surface-hierarchy-base pointer-events-none absolute inset-x-0 bottom-0 z-20 h-25 bg-linear-to-t to-transparent"
          style={{}}
        />
      )}
    </div>
  );
};

export default ChatContent;
