import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { forwardRef, memo } from "react";

import { compositeStyles } from "@/utils/commons/styles";

import MessageNormal from "./features/message-normal";
import type { TMessageItemProps } from "./types";

const MessageSystemError = dynamic(
  () => import("@/components/message-system-error/message-system-error")
);

const MessageItem = forwardRef<HTMLDivElement, TMessageItemProps>(
  ({ message, isConversationGenerating, isLastMessage = false }, ref) => {
    const conversationT = useTranslations("conversationPage");

    const { status, role } = message;
    const isLoading = status === "pending";
    const isError = status === "error";
    const isIdle = status === "idle";
    const articlePosition = role === "user" ? "right" : "left";

    const isLatestAssistantMessageRender =
      isLastMessage && role === "assistant" && !isLoading;

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
          />
        </article>
      );
    }

    if (isError) {
      return (
        <MessageSystemError
          title={conversationT("normalChat.error.title")}
          content={conversationT("normalChat.error.desc")}
        />
      );
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
        <div className={isLatestAssistantMessageRender ? "fade-in-effect" : ""}>
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
            isNewMessage={isLatestAssistantMessageRender}
          />
        </div>
      </article>
    );
  }
);

MessageItem.displayName = "MessageItem";

export default memo(MessageItem);
