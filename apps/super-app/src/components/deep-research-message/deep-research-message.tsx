"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { forwardRef, Fragment, memo, useEffect } from "react";

import { MessageUpgradePremium } from "@/components/message-upgrade-premium";
import { conversationUC } from "@/core/usecases";
import { useHandleGetCitationSources } from "@/hooks/citations/use-handle-get-citation-sources";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import { openNewTab } from "@/utils/commons/helpers";

import { ProgressThinking } from "../progress-thinking";
import type { TProgressThinkingProps } from "../progress-thinking/types";
import DeepResearchThinkingHeader from "./deep-research-thinking-header";
import DeepResearchThinkingItem from "./deep-research-thinking-item";
import type { TMessageDeepResearchProps } from "./types";

const MessageMarkdown = dynamic(
  () => import("@/components/message-markdown/message-markdown"),
  { ssr: false }
);
const TextShimmer = dynamic(
  () => import("@/components/text-shimmer/text-shimmer")
);

const DeepResearchSourceButton = dynamic(
  () => import("./deep-research-sources-button")
);
const MessageActions = dynamic(
  () => import("@/components/message-bubble/message-actions")
);

const MessageReachLimit = dynamic(
  () => import("@/components/message-reach-limit/message-reach-limit")
);

const MessageNormal = dynamic(
  () => import("../message-item/features/message-normal")
);
const AssistantBubbleLoading = dynamic(
  () => import("@/components/assistant-bubble-loading/assistant-bubble-loading")
);
const MAX_RETRY_GET_CITATION = 3;

const MessageDeepResearch = forwardRef<
  HTMLDivElement,
  TMessageDeepResearchProps
>((props: TMessageDeepResearchProps, ref) => {
  const {
    message,
    isShowRegenerateButton,
    isGenerating,
    onCopyMessage,
    onRegenerateMessage,
  } = props;
  const { status, type } = message;
  const isClarifyMessage = type === "deep_research_analyze";
  const isReachedLimit = status === "reachedLimit";
  const isLoading = status === "pending";
  const isPremiumOnly = status === "premiumOnly";
  const showActions =
    !isGenerating && message.role === "assistant" && !isLoading;

  const isShowSourceButton =
    message.deepResearchInfo?.citations &&
    message.deepResearchInfo?.citations.length > 0;

  const conversationId = useConversationState((state) => state.selectedId);
  const setRightBarConfig = useGlobalState(
    (state) => state.setRightSidebarConfig
  );
  const conversationT = useTranslations("conversationPage");

  const isExistContent = message.content.length > 0;

  const { retryGetCitationHandler } = useHandleGetCitationSources(
    conversationId,
    message.id
  );

  // For Tracking
  const user = useGlobalState((state) => state.user);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const generateReachedLimitTimeDeepResearch =
    conversationUC.generateReachedLimitTimeDeepResearch();

  const fullSteps: TProgressThinkingProps["steps"] = [
    {
      delay: 90_000,
      description: conversationT("deepResearch.thinking"),
      key: "thinking",
      state: "completed",
    },
    {
      delay: 75_000,
      description: conversationT("deepResearch.researching"),
      key: "researching",
      state: "completed",
    },
    {
      delay: 60_000,
      description: conversationT("deepResearch.exploring"),
      key: "exploring",
      state: "completed",
    },
    {
      delay: 45_000,
      description: conversationT("deepResearch.consolidatingResult"),
      key: "analyzing",
      state: "completed",
    },
    {
      delay: 30_000,
      description: conversationT("deepResearch.done"),
      key: "done",
      state: "completed",
    },
  ];

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

  const handleClickReferenceBadge = (index: string | number) => {
    const position = Number(index) === 0 ? 0 : Number(index) - 1;
    const item = message.deepResearchInfo?.citations[position];
    if (item) {
      openNewTab(item.url);
    }
  };

  const handleClickSourceButton = () => {
    // Tracking ChatDeepResearchSourceView
    sendTrackingEvent({
      name: EventKeys.ChatDeepResearchSourceView,
      payload: {
        vulcan_user_id: user.id,
      },
    });

    const retryHandler = retryGetCitationHandler({
      maxRetries: MAX_RETRY_GET_CITATION,
    });
    retryHandler();
  };

  const content = () => {
    if (isLoading) {
      return (
        <TextShimmer className="text-footnoteM-neutral text-start">
          {conversationT("deepResearch.loading.desc")}
        </TextShimmer>
      );
    }

    if (!message.deepResearchInfo?.steps) {
      return null;
    }

    const deepResearchSteps = message.deepResearchInfo.steps;
    const listResearchStepKeys = Object.keys(
      deepResearchSteps
    ) as (keyof typeof deepResearchSteps)[];
    const Content = listResearchStepKeys.map((key, index) => {
      if (!deepResearchSteps[key]) {
        return <Fragment key={key} />;
      }

      const mappingStepKey: Record<keyof typeof deepResearchSteps, string> = {
        analyzing: conversationT("deepResearch.consolidatingResult"),
        done: conversationT("deepResearch.done"),
        exploring: conversationT("deepResearch.exploring"),
        researching: conversationT("deepResearch.researching"),
        thinking: conversationT("deepResearch.thinking"),
      };
      const isLastItem = index === listResearchStepKeys.length - 1;

      return (
        <DeepResearchThinkingItem
          key={key}
          title={mappingStepKey[key]}
          content={deepResearchSteps[key]}
          className={
            isLastItem ? "" : "thickness-b-thin border-border-general-secondary"
          }
          onClickBadgeReference={handleClickReferenceBadge}
        />
      );
    });

    return <div className="space-y-small-1 w-full">{Content}</div>;
  };

  if (isLoading && isClarifyMessage) {
    return <AssistantBubbleLoading />;
  }

  if (isClarifyMessage) {
    return (
      <MessageNormal
        ref={ref}
        message={message}
        isGenerating={isGenerating}
        isShowRegenerateButton={false}
        onCopyMessage={onCopyMessage}
        onRegenerateMessage={onRegenerateMessage}
      />
    );
  }

  if (isPremiumOnly) {
    return (
      <MessageUpgradePremium
        title={conversationT("deepResearch.free.title")}
        description={conversationT("deepResearch.free.desc")}
        purchaseSource="deep_research"
      />
    );
  }

  if (isReachedLimit) {
    return (
      <MessageReachLimit
        title={conversationT("deepResearch.reachLimit.title")}
        description={conversationT("deepResearch.reachLimit.desc", {
          resetTime: generateReachedLimitTimeDeepResearch,
        })}
        purchaseSource="deep_research"
      />
    );
  }

  return (
    <div className="gap-large-4 flex w-full flex-col">
      <div className="gap-medium-1.5 flex w-full flex-col">
        <ProgressThinking
          steps={fullSteps}
          title={
            <DeepResearchThinkingHeader
              timing={Number(message.deepResearchInfo?.processTime)}
              amountOfSource={message.deepResearchInfo?.citations.length}
            />
          }
          content={content()}
          status={isLoading ? "pending" : "completed"}
          contentClassName={isLoading ? "justify-center items-center" : ""}
        />
        {isShowSourceButton && (
          <DeepResearchSourceButton onClick={handleClickSourceButton} />
        )}
      </div>
      <div className="w-full">
        {isExistContent && (
          <MessageMarkdown
            conversationId={conversationId}
            messageId={message.id}
            content={message.uiContent ?? ""}
            onBadgeClick={handleClickReferenceBadge}
          />
        )}
        {showActions && (
          <MessageActions
            message={message}
            conversationId={conversationId}
            isShowDownloadButton
            isShowRegenerateBtn={isShowRegenerateButton}
            onCopyMessage={onCopyMessage}
            onRegenerateMessage={onRegenerateMessage}
          />
        )}
      </div>
    </div>
  );
});

MessageDeepResearch.displayName = "MessageDeepResearch";

export default memo(MessageDeepResearch);
