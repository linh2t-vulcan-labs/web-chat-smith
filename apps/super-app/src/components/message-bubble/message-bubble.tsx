import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";

import type { TSelectedFile } from "@/core/models/conversation";
import useArtStyles from "@/hooks/image-creation/use-art-styles";
import { checkImageFileType } from "@/utils/commons/helpers";
import { scrollToQuestion } from "@/utils/commons/scroll";
import { compositeStyles } from "@/utils/commons/styles";
import { extensionToMimeTypeMap } from "@/utils/constants/file";

import { AttachmentFiles } from "../attachment-files";
import { MessageMarkdown } from "../message-markdown";
import { getMessageBubbleStyles } from "./consts";
import type { TMessageBubble } from "./types";

const MessageActions = dynamic(() => import("./message-actions"));

const DEFAULT_FILES: TSelectedFile[] = [];

export default function MessageBubble({
  isShowRegenerateBtn,
  position,
  message,
  conversationId = "",
  isGenerating,
  isNewMessage,
  files = DEFAULT_FILES,
  onCopyMessage,
  onRegenerateMessage,
}: TMessageBubble) {
  const { allAIArtOptions } = useArtStyles();
  const conversationT = useTranslations("conversationPage");
  const styles = getMessageBubbleStyles(position);
  const isLeft = position === "left";
  const showActions = isLeft && !isGenerating;
  const imageFiles = files.filter((file) =>
    checkImageFileType(file.fileName, file.mimeType)
  );
  const pdfFiles = files.filter((file) =>
    file.mimeType.startsWith(extensionToMimeTypeMap.pdf)
  );
  const { content, imageCreationInfo } = message;
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isNewMessage) {
      return;
    } // Only trigger when it's a new message
    // Only process when it's an answer (isLeft)
    if (!isLeft || !bubbleRef.current) {
      return;
    }

    // Delay to ensure DOM has finished rendering and has enough height
    const timeoutId = setTimeout(() => scrollToQuestion(bubbleRef), 150);

    return () => clearTimeout(timeoutId);
  }, [isLeft, content, isNewMessage]); // Trigger when content changes (streaming)

  const renderContent = () => {
    if (isLeft) {
      return <MessageMarkdown content={content} />;
    }

    const imageCreationStyle = allAIArtOptions.find(
      (option) => option.value === imageCreationInfo?.style
    );

    return (
      <div className="gap-small-1 inline-flex flex-col">
        {content && (
          <p className="break-word-legacy text-bodyM-neutral text-text-conversation-user-default block">
            {content}
          </p>
        )}
        {imageCreationInfo && (
          <div className="rounded-default thickness-thin border-border-general-primary bg-surface-general-glass px-small-1 pb-small-0.5 pt-small-0.25 text-footnoteS-neutral text-text-general-primary inline-flex w-fit items-center justify-center backdrop-blur-2xl">
            {imageCreationStyle?.title} {conversationT("createImage.style")}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={bubbleRef}
      className={compositeStyles(
        "gap-small-1 flex w-full flex-col",
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
          <MessageActions
            message={message}
            conversationId={conversationId}
            isShowRegenerateBtn={isShowRegenerateBtn}
            onCopyMessage={onCopyMessage}
            onRegenerateMessage={onRegenerateMessage}
          />
        )}
      </div>
      <AttachmentFiles imageFiles={imageFiles} pdfFiles={pdfFiles} />
    </div>
  );
}
