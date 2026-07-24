import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { forwardRef, memo, useMemo } from "react";

import { MessageBubble } from "@/components/message-bubble";
import { MessageError } from "@/components/message-error";
import type { TSelectedFile } from "@/core/models/conversation";
import { fileUC } from "@/core/usecases";
import useFreeUsageConfig from "@/hooks/remote-config/use-free-usage-config";
import useNetwork from "@/hooks/use-network";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";

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

const renderUpgradeContentSpan = (chunks: React.ReactNode) => (
  <span className="text-text-general-secondary">{chunks}</span>
);

const MessageNormal = forwardRef<HTMLDivElement, TMessageNormalProps>(
  (props, _ref) => {
    const {
      message,
      isShowRegenerateButton,
      isGenerating,
      isNewMessage,
      onCopyMessage,
      onRegenerateMessage,
    } = props;

    const { status, role } = message;
    const conversationId = useConversationState((state) => state.selectedId);
    const chatFreeUsage = useGlobalState((state) => state.chatFreeUsage);
    const freeUsageResetInfo = useGlobalState(
      (state) => state.freeUsageResetInfo
    );
    // Remote Config
    const { enabled: isFreeUserUsageEnabled } = useFreeUsageConfig();
    const mainLayoutT = useTranslations("mainLayout");

    const isOnline = useNetwork();

    const articlePosition = role === "user" ? "right" : "left";
    const isReachedLimit = status === "reachedLimit";
    const isPremiumOnly = status === "premiumOnly";

    const isLoading = status === "pending";

    const renderFiles: TSelectedFile[] =
      fileUC.convertFileMessageToSelectedFile(message.files);

    const upgradeContent = useMemo(() => {
      const hitDailyLimit =
        chatFreeUsage.chat === 0 &&
        freeUsageResetInfo.chat?.isWithinPeriod &&
        !freeUsageResetInfo.chat?.isLastDayOfPeriod;

      if (hitDailyLimit && isFreeUserUsageEnabled) {
        return {
          description: mainLayoutT.rich(
            "floatingUpgradeBlock.hitDailyLimit.description",
            {
              span: renderUpgradeContentSpan,
            }
          ),
          title: mainLayoutT("floatingUpgradeBlock.hitDailyLimit.title"),
        };
      }

      return {
        description: mainLayoutT(
          "floatingUpgradeBlock.greatProgress.description"
        ),
        title: mainLayoutT("floatingUpgradeBlock.greatProgress.title"),
      };
    }, [
      chatFreeUsage.chat,
      freeUsageResetInfo.chat?.isWithinPeriod,
      freeUsageResetInfo.chat?.isLastDayOfPeriod,
      isFreeUserUsageEnabled,
      mainLayoutT,
    ]);

    if (isPremiumOnly) {
      return (
        <MessageUpgradePremium
          title={upgradeContent.title}
          description={upgradeContent.description}
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
        onRegenerateMessage={onRegenerateMessage}
        onCopyMessage={onCopyMessage}
        isNewMessage={isNewMessage}
      />
    );
  }
);

MessageNormal.displayName = "MessageNormal";

export default memo(MessageNormal);
