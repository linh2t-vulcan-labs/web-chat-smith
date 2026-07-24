import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

import { MessageMarkdown } from "@/components/message-markdown/";
import { scrollToQuestion } from "@/utils/commons/scroll";
import { compositeStyles } from "@/utils/commons/styles";

import { getMessageBubbleStyles } from "./consts";
import type { TMessageBubble } from "./types";

const MessageActions = dynamic(() => import("./message-actions"));

export default function MessageBubble({
  position,
  message,
  conversationId = "",
  isGenerating,
}: TMessageBubble) {
  const styles = getMessageBubbleStyles(position);
  const isLeft = position === "left";
  const { content } = message;
  const bubbleRef = useRef<HTMLDivElement>(null);

  const showActions = isLeft && !isGenerating;

  useEffect(() => {
    // Only process when it's a response (isLeft) and is generating
    if (!isLeft) {
      return;
    }

    // Delay to ensure DOM has finished rendering
    const timeoutId = setTimeout(() => scrollToQuestion(bubbleRef), 150);

    return () => clearTimeout(timeoutId);
  }, [isLeft, isGenerating, content]); // Trigger when content changes (streaming)

  const renderContent = () => {
    if (isLeft) {
      return <MessageMarkdown content={content} />;
    }

    return (
      <div className="inline-flex flex-col gap-small-1">
        <p className="break-word-legacy block text-bodyM-neutral text-text-conversation-user-default">
          {content}
        </p>
      </div>
    );
  };

  return (
    <div
      ref={bubbleRef}
      className={compositeStyles(
        "flex w-full flex-col gap-medium-2",
        isLeft ? "items-start" : "items-end"
      )}
    >
      <div
        className={compositeStyles(
          "max-w-full",
          styles.background,
          styles.padding,
          styles.radius
        )}
      >
        {renderContent()}
        {showActions && (
          <MessageActions message={message} conversationId={conversationId} />
        )}
      </div>
      <div className="h-1 w-full bg-transparent" />
    </div>
  );
}
