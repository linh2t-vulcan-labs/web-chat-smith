"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import useInfiniteScroll from "react-infinite-scroll-hook";

import type { TConversationProps } from "@/components/conversation-types/types";
import { EmptyMessage } from "@/components/empty-message";
import { FetchingErrorMessage } from "@/components/fetching-error-message";
import MessageItem from "@/components/message-item/message-item";
import Spinner from "@/components/spinner/spinner";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { useKeepScrollPosition } from "@/hooks/use-keep-scroll-position";
import { useIsDisabledInputBasedOnMessageStatus } from "@/store/conversation/hooks";

const ChatSuggestionV2 = dynamic(
  () => import("@/components/chat-suggestion-v2/chat-suggestion-v2")
);

function computeConversationContentFlags({
  status,
  suggestionsCount,
  isDisabledInputBasedOnMessageStatus,
  hasNextPage,
  isLoading,
  isFetchNextPageError,
  enabledChatSync,
  messagesCount,
  isFetchedMessages,
  isFetchMessageError,
}: {
  status: TConversationProps["states"]["status"];
  suggestionsCount: number;
  isDisabledInputBasedOnMessageStatus: boolean;
  hasNextPage: boolean;
  isLoading: boolean;
  isFetchNextPageError: boolean;
  enabledChatSync: boolean;
  messagesCount: number;
  isFetchedMessages: boolean;
  isFetchMessageError: boolean;
}) {
  const isShowSuggestions =
    status === "submitted" &&
    suggestionsCount > 0 &&
    !isDisabledInputBasedOnMessageStatus;
  const isShowLoadingProgress =
    hasNextPage && !isLoading && status !== "loading"; // After get originalData;
  const isInfiniteScrollHasNextPage =
    hasNextPage && !isLoading && !isFetchNextPageError;
  const isShowEmptyMessage =
    enabledChatSync && messagesCount === 0 && isFetchedMessages;
  const isShowFetchError =
    isFetchMessageError && !isLoading && messagesCount === 0;

  return {
    isInfiniteScrollHasNextPage,
    isShowEmptyMessage,
    isShowFetchError,
    isShowLoadingProgress,
    isShowSuggestions,
  };
}

export default function ConversationContent({
  states,
  refs,
  handlers,
  data,
}: Readonly<TConversationProps>) {
  const {
    status,
    isFetchingNextPage,
    isFetchedMessages,
    isLoading,
    hasNextPage,
    isFetchMessageError,
    isFetchNextPageError,
  } = states;
  const { messages = [], suggestions = [] } = data;
  const { lastItemRef, lastMessageRef } = refs;
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const {
    onFetchNextPage,
    setScrollContainerZone,
    onRegenerateMessage,
    onClickSuggestion,
    onRefetchMessages,
  } = handlers;
  const { isBeta: enabledChatSync } = useChatSyncFlag();
  const commonT = useTranslations("common");
  const conversationT = useTranslations("conversationPage");
  const { containerRef, isPrependingRef, prevScrollHeightRef } =
    useKeepScrollPosition(messages);
  const isDisabledInputBasedOnMessageStatus =
    useIsDisabledInputBasedOnMessageStatus();
  const {
    isShowSuggestions,
    isShowLoadingProgress,
    isInfiniteScrollHasNextPage,
    isShowEmptyMessage,
    isShowFetchError,
  } = computeConversationContentFlags({
    enabledChatSync,
    hasNextPage,
    isDisabledInputBasedOnMessageStatus,
    isFetchMessageError,
    isFetchNextPageError,
    isFetchedMessages,
    isLoading,
    messagesCount: messages.length,
    status,
    suggestionsCount: suggestions.length,
  });
  const isConversationGenerating = status === "generating";

  // Store previous status to detect new message
  const prevStatus = useRef(status);

  // Memoized so the ref callback identity is stable across renders — an
  // inline ref function runs its cleanup/setup pair on every render, and
  // since setScrollContainerZone is a state setter, that would re-trigger
  // renders forever.
  const setContainerRef = useCallback(
    (node: HTMLDivElement | null) => {
      containerRef.current = node;
      setScrollContainerZone(node);
    },
    [containerRef, setScrollContainerZone]
  );

  // Handle load more with scroll position management
  const handleLoadMore = () => {
    if (onFetchNextPage) {
      const container = containerRef.current;
      if (container) {
        isPrependingRef.current = true;
        prevScrollHeightRef.current = container.scrollHeight;
      }
      onFetchNextPage();
    }
  };

  // Use infinite scroll hook
  const [loadingRef] = useInfiniteScroll({
    hasNextPage: isInfiniteScrollHasNextPage,
    loading: isFetchingNextPage,
    onLoadMore: handleLoadMore,
    rootMargin: "0px",
  });

  // Detect new message
  useEffect(() => {
    if (prevStatus.current === "loading" && status === "submitted") {
      setHasNewMessage(true);
    }
    // Set current status
    prevStatus.current = status;
  }, [status]);

  // Only show the full-page spinner on a genuine first load (no messages to
  // show yet). Once messages already exist locally, a query refetch — e.g.
  // triggered by the URL swapping from the draft view to the real
  // `/conversation/{id}` right after the first message creates the
  // conversation — would otherwise flash this over content that's already
  // rendered, discarding it for no reason.
  if (isLoading && messages.length === 0) {
    return (
      <div className="flex size-full items-center justify-center">
        <Spinner size={30} />
      </div>
    );
  }

  if (isShowFetchError) {
    return (
      <FetchingErrorMessage
        text={conversationT("toast.error.failResult")}
        onRetry={onRefetchMessages}
      />
    );
  }

  if (isShowEmptyMessage) {
    return (
      <div className="px-4">
        <div className="gap-medium-3 mx-auto flex w-full max-w-(--breakpoint-md) flex-col">
          <EmptyMessage />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex size-full flex-col justify-between">
      <div
        ref={setContainerRef}
        className="max-h-full w-full overflow-x-hidden overflow-y-auto px-4 [scrollbar-gutter:stable]"
      >
        <div className="gap-medium-3 mx-auto flex w-full max-w-(--breakpoint-md) flex-col">
          {isShowLoadingProgress && (
            <div
              ref={loadingRef}
              className="flex size-full h-4 items-center justify-center"
            >
              {isFetchingNextPage && <Spinner size={15} />}
            </div>
          )}
          {isFetchNextPageError && !isFetchingNextPage && (
            <FetchingErrorMessage
              text={commonT("cta.failLoadMoreResult")}
              onRetry={handleLoadMore}
            />
          )}
          {messages.map((message, index) => {
            const isLastMessage = messages.length - 1 === index;

            return (
              <MessageItem
                ref={(ref) => {
                  if (isLastMessage) {
                    lastMessageRef.current = ref;
                  }
                }}
                isConversationGenerating={isConversationGenerating}
                key={message.id}
                message={message}
                isLastMessage={isLastMessage}
                onRegenerateMessage={onRegenerateMessage}
                isNewMessage={isLastMessage && hasNewMessage}
              />
            );
          })}
          {isShowSuggestions && (
            <ChatSuggestionV2
              className="fade-in-delayed -mt-small-1 flex-1"
              data={suggestions}
              onClickSuggestion={onClickSuggestion}
            />
          )}
          <div
            ref={lastItemRef}
            className="pointer-events-none h-1 w-full"
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
