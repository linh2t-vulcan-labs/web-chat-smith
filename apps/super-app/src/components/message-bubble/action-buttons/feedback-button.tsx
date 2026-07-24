"use client";

import { useToggle } from "@uidotdev/usehooks";
import { memo } from "react";

import { Button } from "@/components/button";
import { Icon } from "@/components/icon";
import type { TFeedbackButtonProps } from "@/components/message-bubble/action-buttons/types";
import { MessageFeedbackModal } from "@/components/message-feedback-modal";
import Tooltip from "@/components/tooltip/tooltip";
import { EMessageFeedbackStatus } from "@/core/models/message-feedback";
import { useCreateMessageFeedback } from "@/hooks/message-feedback/use-create-message-feedback";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useConversationStore } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

function FeedbackButton(props: TFeedbackButtonProps) {
  const { tooltip, type, conversationId, message, readSource } = props;
  const [isOpenFeedbackModal, toggleOpenFeedbackModal] = useToggle();
  const { feedbackStatus, messageId = "" } = message;

  const isLike = type === "like";
  const isActive = isLike
    ? feedbackStatus === EMessageFeedbackStatus.LIKE
    : feedbackStatus === EMessageFeedbackStatus.DISLIKE;
  const conversationStore = useConversationStore();

  const createFeedbackMutation = useCreateMessageFeedback();

  // For Tracking
  const user = useGlobalState((state) => state.user);
  const { sendTrackingEvent } = useSendTrackingEvent();

  const updateMessageFeedbackStatus = (status: EMessageFeedbackStatus) => {
    const { updateFeedbackStatusMessage } = conversationStore.getState();
    updateFeedbackStatusMessage(conversationId, messageId, status);
  };

  // Tracking ChatLike and ChatDislike for Normal char and AI Art
  const handleTrackingEvent = (status: EMessageFeedbackStatus) => {
    const isChatAIArt = message.type === "image_creation";

    if (status === EMessageFeedbackStatus.LIKE) {
      sendTrackingEvent({
        name: isChatAIArt ? EventKeys.ChatArtLike : EventKeys.ChatLike,
        payload: {
          vulcan_user_id: user.id,
        },
      });
    } else {
      sendTrackingEvent({
        name: isChatAIArt ? EventKeys.ChatArtDislike : EventKeys.ChatDislike,
        payload: {
          vulcan_user_id: user.id,
        },
      });
    }
  };

  const submitFeedback = (
    status: EMessageFeedbackStatus,
    reason?: string[],
    detail?: string
  ) => {
    // Track feedback submission
    if (!isActive) {
      handleTrackingEvent(status);
    }
    createFeedbackMutation.mutate({
      conversationId,
      detail,
      messageId,
      readSource,
      reason,
      status,
    });
    updateMessageFeedbackStatus(status);
  };

  const handleClickFeedbackButton = () => {
    if (isActive) {
      submitFeedback(EMessageFeedbackStatus.UNSPECIFIED);
      return;
    }

    if (!isLike) {
      submitFeedback(EMessageFeedbackStatus.DISLIKE);
      toggleOpenFeedbackModal(true);
      return;
    }

    submitFeedback(EMessageFeedbackStatus.LIKE);
  };

  const handleModalSubmit = ({
    reason,
    reasonDetail,
  }: {
    reason: string[];
    reasonDetail: string;
  }) => {
    submitFeedback(EMessageFeedbackStatus.DISLIKE, reason, reasonDetail);
    toggleOpenFeedbackModal(false);
  };

  const onCloseFeedbackModal = () => {
    toggleOpenFeedbackModal(false);
  };

  return (
    <>
      <Tooltip content={tooltip} side="bottom" align="center">
        <Button
          color="negative"
          size="smallIcon"
          rounded="soft"
          className={compositeStyles({
            "bg-surface-action-neutral-hover": isActive,
          })}
          startIcon={
            <Icon
              size={20}
              name={type}
              className={compositeStyles({
                "text-icon-action-primary-default": isActive,
                "text-icon-action-tertiary-default": !isActive,
              })}
            />
          }
          onClick={handleClickFeedbackButton}
        />
      </Tooltip>
      {isOpenFeedbackModal && (
        <MessageFeedbackModal
          open={isOpenFeedbackModal}
          onClose={onCloseFeedbackModal}
          messageType={message.type}
          onSubmit={handleModalSubmit}
        />
      )}
    </>
  );
}

export default memo(FeedbackButton);
