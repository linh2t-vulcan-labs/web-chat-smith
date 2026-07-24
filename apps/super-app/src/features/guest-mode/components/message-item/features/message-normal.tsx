import dynamic from "next/dynamic";
import { forwardRef, memo } from "react";

import { MessageError } from "@/components/message-error";
import type { TSelectedFile } from "@/core/models/conversation";
import { fileUC } from "@/core/usecases";
import { MessageBubble } from "@/features/guest-mode/components/message-item/features/message-bubble";
import { useGuestState } from "@/features/guest-mode/stores/guest-mode/hooks";
import useNetwork from "@/hooks/use-network";

import type { TMessageNormalProps } from "./types";

const AssistantBubbleLoading = dynamic(
  () => import("@/components/assistant-bubble-loading/assistant-bubble-loading")
);
const MessageReachLimit = dynamic(
  () => import("@/components/message-reach-limit/message-reach-limit")
);
const MessageUpgradePremium = dynamic(
  () => import("@/components/message-upgrade-premium/message-upgrade-premium")
);

const MessageNormal = forwardRef<HTMLDivElement, TMessageNormalProps>(
  (props, _ref) => {
    const { message, isShowRegenerateButton, isNewMessage, isGenerating } =
      props;

    const { status, role } = message;
    const conversationId = useGuestState((state) => state.selectedId);
    const isOnline = useNetwork();

    const articlePosition = role === "user" ? "right" : "left";
    const isReachedLimit = status === "reachedLimit";
    const isPremiumOnly = status === "premiumOnly";

    const isLoading = status === "pending";

    const renderFiles: TSelectedFile[] =
      fileUC.convertFileMessageToSelectedFile(message.files);

    if (isPremiumOnly) {
      const premiumOnly = message.content.split(".") || [];

      return (
        <MessageUpgradePremium
          title={premiumOnly?.[0]}
          description={premiumOnly?.[1]}
        />
      );
    }

    if (isReachedLimit) {
      const reachedLimitMessage = message.content.split(".") || [];
      return (
        <MessageReachLimit
          title={reachedLimitMessage?.[0]}
          description={reachedLimitMessage?.[1]}
          purchaseSource="free_turn"
        />
      );
    }

    if (!isOnline && isLoading) {
      return <MessageError onRetry={() => location.reload()} />;
    }

    if (isLoading) {
      return <AssistantBubbleLoading />;
    }

    return (
      <MessageBubble
        position={articlePosition}
        message={message}
        conversationId={conversationId}
        files={renderFiles}
        isGenerating={isGenerating}
        isShowRegenerateBtn={isShowRegenerateButton}
        isNewMessage={isNewMessage}
      />
    );
  }
);

MessageNormal.displayName = "MessageNormal";

export default memo(MessageNormal);
