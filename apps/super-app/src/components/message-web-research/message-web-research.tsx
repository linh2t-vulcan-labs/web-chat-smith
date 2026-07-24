import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

import MessageActions from "@/components/message-bubble/message-actions";
import { MessageMarkdown } from "@/components/message-markdown";
import { useHandleGetCitationSources } from "@/hooks/citations/use-handle-get-citation-sources";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import { scrollToQuestion } from "@/utils/commons/scroll";

import type { TWebResearchProps } from "./types";
import WebSearchSourceButton from "./web-search-sources-button";

const MAX_RETRY_GET_CITATION = 3;

const MessageReachLimit = dynamic(
  () => import("@/components/message-reach-limit/message-reach-limit")
);
const MessageUpgradePremium = dynamic(
  () => import("@/components/message-upgrade-premium/message-upgrade-premium")
);

const TextShimmer = dynamic(
  () => import("@/components/text-shimmer/text-shimmer")
);

const MessageWebSearch = ({
  isGenerating,
  isShowRegenerateButton,
  message,
  isNewMessage,
  onCopyMessage,
  onRegenerateMessage,
}: TWebResearchProps) => {
  // Global state
  const setRightBarConfig = useGlobalState(
    (state) => state.setRightSidebarConfig
  );

  const conversationId = useConversationState((state) => state.selectedId);
  const { retryGetCitationHandler } = useHandleGetCitationSources(
    conversationId,
    message.id
  );

  // Other
  const { status, content } = message;
  const isLoading = status === "pending";
  const isReachedLimit = status === "reachedLimit";
  const isPremiumOnly = status === "premiumOnly";
  const showActions =
    !isGenerating && message.role === "assistant" && !isLoading;
  const webSearchRef = useRef<HTMLDivElement>(null);
  const conversationT = useTranslations("conversationPage");

  // For Tracking
  const user = useGlobalState((state) => state.user);
  const { sendTrackingEvent } = useSendTrackingEvent();

  useEffect(() => {
    if (!isNewMessage) {
      return;
    } // Only trigger when it's a new message
    // Only process when it's an answer (isLeft)
    if (!webSearchRef.current) {
      return;
    }

    // Delay to ensure DOM has finished rendering and has enough height
    const timeoutId = setTimeout(() => scrollToQuestion(webSearchRef), 150);

    return () => clearTimeout(timeoutId);
  }, [content, isNewMessage]); // Trigger when content changes (streaming)

  const handleClickSourceButton = () => {
    // Handle ChatWebSearchSourceView
    sendTrackingEvent({
      name: EventKeys.ChatWebSearchSourceView,
      payload: {
        vulcan_user_id: user.id,
      },
    });
    const retryHandler = retryGetCitationHandler({
      isShowPosition: false,
      maxRetries: MAX_RETRY_GET_CITATION,
    });
    retryHandler();
  };

  useEffect(
    () => () => {
      setRightBarConfig({
        contentSetting: null,
        isOpen: false,
        title: null,
      });
    },
    [setRightBarConfig]
  );

  if (isPremiumOnly) {
    return (
      <MessageUpgradePremium
        title={conversationT("webSearch.free.title")}
        description={conversationT("webSearch.free.desc")}
      />
    );
  }

  if (isReachedLimit) {
    return (
      <MessageReachLimit
        title={conversationT("webSearch.reachLimit.title")}
        description={conversationT("webSearch.reachLimit.desc")}
        purchaseSource="web_search"
      />
    );
  }

  if (isLoading) {
    return (
      <TextShimmer>{conversationT("webSearch.loading.title")}</TextShimmer>
    );
  }

  return (
    <div className="gap-medium-3 flex flex-col" ref={webSearchRef}>
      <WebSearchSourceButton onClick={handleClickSourceButton} />
      <div className="gap-small-1 flex flex-col">
        <MessageMarkdown
          conversationId={conversationId}
          messageId={message.id}
          content={content ?? ""}
        />
        {showActions && (
          <MessageActions
            conversationId={conversationId}
            message={message}
            isShowRegenerateBtn={isShowRegenerateButton}
            onCopyMessage={onCopyMessage}
            onRegenerateMessage={onRegenerateMessage}
          />
        )}
      </div>
    </div>
  );
};

export default MessageWebSearch;
