import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";

import { Button } from "@/components/button";
import FeedbackButton from "@/components/message-bubble/action-buttons/feedback-button";
import { ToolTip } from "@/components/tooltip";
import { conversationUC } from "@/core/usecases";
import { useChatSyncFlag } from "@/features/chat-sync/hooks/use-chat-sync-flag";
import { useDeletingConversation } from "@/hooks/conversations/use-deleting-conversation";
import { compositeStyles } from "@/utils/commons/styles";

import { CopyButton } from "../copy-button";
import type { TMessageActionsProps } from "./types";

const DownloadButton = dynamic(
  () => import("../download-button/download-button")
);

const MessageActions = ({
  isShowRegenerateBtn,
  message,
  conversationId,
  isShowDownloadButton,
  onCopyMessage,
  onRegenerateMessage,
}: TMessageActionsProps) => {
  const conversationT = useTranslations("conversationPage");

  const downloadContent = conversationUC.processExportContent(message);
  const isShowRatingMessage = !!message.messageId;
  const { checkDeletingConversation } = useDeletingConversation();
  const { isBeta } = useChatSyncFlag();
  const isDeleting = checkDeletingConversation(conversationId);

  return (
    <div
      className={compositeStyles(
        "mt-small-1 gap-small-0.25 flex items-center",
        isDeleting && "pointer-events-none opacity-50"
      )}
    >
      <CopyButton content={message.content} onCopy={onCopyMessage} />
      {isShowRegenerateBtn && (
        <ToolTip
          content={conversationT("tooltip.regenerate")}
          side="bottom"
          align="center"
        >
          <Button
            color="negative"
            size="smallIcon"
            rounded="soft"
            onClick={onRegenerateMessage}
            startIcon={
              <Image
                src="/icons/generate.svg"
                width={20}
                height={20}
                alt="generate icon"
                loading="lazy"
              />
            }
          />
        </ToolTip>
      )}
      {isShowRatingMessage && (
        <>
          <FeedbackButton
            tooltip={conversationT("tooltip.like")}
            type="like"
            conversationId={conversationId}
            message={message}
            readSource={
              isBeta ? "READ_SOURCE_CONVERSATION_NEXUS" : "READ_SOURCE_ENGINE"
            }
          />
          <FeedbackButton
            tooltip={conversationT("tooltip.dislike")}
            type="dislike"
            conversationId={conversationId}
            message={message}
            readSource={
              isBeta ? "READ_SOURCE_CONVERSATION_NEXUS" : "READ_SOURCE_ENGINE"
            }
          />
        </>
      )}

      {isShowDownloadButton && <DownloadButton content={downloadContent} />}
    </div>
  );
};

export default MessageActions;
