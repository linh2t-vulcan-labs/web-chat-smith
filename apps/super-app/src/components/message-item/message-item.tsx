import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { forwardRef, memo } from "react";

import { MessageAnswersSkipped } from "@/components/message-answers-skipped";
import type { TMessageType } from "@/core/models/conversation";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

import MessageNormal from "./features/message-normal";
import type { TMessageItemProps } from "./types";

const MessageSystemError = dynamic(
  () => import("@/components/message-system-error/message-system-error")
);
const DeepResearchMessage = dynamic(
  () => import("../deep-research-message/deep-research-message")
);
const AIArtMessage = dynamic(() => import("../ai-art-message/ai-art-message"));
const WebSearchMessage = dynamic(
  () => import("../message-web-research/message-web-research")
);

// Intentionally a no-op: no tracking event for deep_research_analyze regenerate
const noop = () => {
  // no-op
};

const MessageItem = forwardRef<HTMLDivElement, TMessageItemProps>(
  (
    {
      message,
      isConversationGenerating,
      isLastMessage = false,
      onRegenerateMessage,
      isNewMessage,
    },
    ref
  ) => {
    const setSuggestions = useConversationState(
      (state) => state.setSuggestions
    );
    const conversationT = useTranslations("conversationPage");
    const { status, role } = message;
    const isLoading = status === "pending";
    const isError = status === "error";
    const isIdle = status === "idle";
    const articlePosition = role === "user" ? "right" : "left";
    const isLatestAssistantMessageRender =
      isLastMessage && role === "assistant" && !isLoading;

    // For Tracking
    const user = useGlobalState((state) => state.user);
    const { sendTrackingEvent } = useSendTrackingEvent();

    const modeRegenerateEventMap: Record<TMessageType, () => void> = {
      chat: () => {
        sendTrackingEvent({
          name: EventKeys.ChatRegenerateTap,
          payload: {
            vulcan_user_id: user.id,
          },
        });
      },
      deep_research: () => {
        sendTrackingEvent({
          name: EventKeys.ChatDeepResearchRegenerate,
          payload: {
            vulcan_user_id: user.id,
          },
        });
      },
      deep_research_analyze: noop,
      image_creation: () => {
        sendTrackingEvent({
          name: EventKeys.ChatArtRegenerate,
          payload: {
            vulcan_user_id: user.id,
          },
        });
      },
      realtime_search: () =>
        sendTrackingEvent({
          name: EventKeys.ChatWebSearchRegenerate,
          payload: {
            vulcan_user_id: user.id,
          },
        }),
    };

    const handleRegenerateMessage = () => {
      const trackRegenerateEvent = modeRegenerateEventMap[message.type];
      setSuggestions([]);

      if (trackRegenerateEvent) {
        trackRegenerateEvent();
      }
      onRegenerateMessage?.();
    };

    const handleCopyMessage = () => {
      switch (message.type) {
        case "deep_research": {
          // Tracking ChatDeepResearchCopy
          sendTrackingEvent({
            name: EventKeys.ChatDeepResearchCopy,
            payload: {
              vulcan_user_id: user.id,
            },
          });
          break;
        }
        case "realtime_search": {
          // Tracking ChatWebSearchCopy
          sendTrackingEvent({
            name: EventKeys.ChatWebSearchCopy,
            payload: {
              vulcan_user_id: user.id,
            },
          });
          break;
        }
        default: {
          // Tracking ChatCopyTap
          sendTrackingEvent({
            name: EventKeys.ChatCopyTap,
            payload: {
              vulcan_user_id: user.id,
            },
          });
          break;
        }
      }
    };

    const renderContent = (messageType: TMessageType) => {
      switch (messageType) {
        case "deep_research_analyze":
        case "deep_research": {
          return (
            <DeepResearchMessage
              message={message}
              isGenerating={
                isConversationGenerating && isLatestAssistantMessageRender
              }
              isShowRegenerateButton={
                !isConversationGenerating && isLatestAssistantMessageRender
              }
              onCopyMessage={handleCopyMessage}
              onRegenerateMessage={handleRegenerateMessage}
            />
          );
        }
        case "image_creation": {
          return (
            <AIArtMessage
              message={message}
              isGenerating={
                isConversationGenerating && isLatestAssistantMessageRender
              }
              isShowRegenerateButton={
                !isConversationGenerating && isLatestAssistantMessageRender
              }
              onCopyMessage={handleCopyMessage}
              onRegenerateMessage={handleRegenerateMessage}
              isNewMessage={isNewMessage}
            />
          );
        }
        case "realtime_search": {
          return (
            <WebSearchMessage
              message={message}
              isGenerating={
                isConversationGenerating && isLatestAssistantMessageRender
              }
              isShowRegenerateButton={
                !isConversationGenerating && isLatestAssistantMessageRender
              }
              onCopyMessage={handleCopyMessage}
              onRegenerateMessage={handleRegenerateMessage}
              isNewMessage={isNewMessage}
            />
          );
        }
        default: {
          return (
            <MessageNormal
              message={message}
              isGenerating={
                isConversationGenerating && isLatestAssistantMessageRender
              }
              isShowRegenerateButton={
                !isConversationGenerating &&
                !isIdle &&
                isLatestAssistantMessageRender
              }
              onCopyMessage={handleCopyMessage}
              onRegenerateMessage={handleRegenerateMessage}
              isNewMessage={isNewMessage}
            />
          );
        }
      }
    };

    if (role === "developer") {
      return null;
    }

    if (role === "user") {
      return (
        <article
          ref={ref}
          data-align={articlePosition}
          className={compositeStyles(
            `flex flex-col`,
            "data-[align=left]:justify-start data-[align=right]:justify-end"
          )}
        >
          <MessageNormal
            ref={ref}
            message={message}
            isGenerating={
              isConversationGenerating && isLatestAssistantMessageRender
            }
            isShowRegenerateButton={
              !isConversationGenerating && isLatestAssistantMessageRender
            }
            onCopyMessage={handleCopyMessage}
            onRegenerateMessage={handleRegenerateMessage}
          />{" "}
        </article>
      );
    }

    if (isError) {
      if (message.type === "image_creation") {
        return (
          <MessageSystemError
            title={conversationT("createImage.error.title")}
            content={message.content}
          />
        );
      }

      return (
        <MessageSystemError
          title={conversationT("normalChat.error.title")}
          content={conversationT("normalChat.error.desc")}
        />
      );
    }

    if (role === "assistant" && status === "skipped") {
      return <MessageAnswersSkipped />;
    }

    return (
      <article
        ref={ref}
        data-align={articlePosition}
        className={compositeStyles(
          `flex flex-col`,
          "data-[align=left]:justify-start data-[align=right]:justify-end"
        )}
      >
        {/* If the message is new and not pending, apply fade in effect */}
        <div
          className={
            isNewMessage && status !== "pending" ? "fade-in-effect" : ""
          }
        >
          {renderContent(message.type)}
        </div>
      </article>
    );
  }
);

MessageItem.displayName = "MessageItem";

export default memo(MessageItem);
