import { useTranslations } from "next-intl";
import React, { useMemo } from "react";

import { FloatingUpgradeBlock } from "@/components/floating-upgrade";
import { EConversationMode } from "@/core/models/conversation";
import { productUseCases } from "@/core/usecases/product";
import useFreeUsageConfig from "@/hooks/remote-config/use-free-usage-config";
import { useTriggerFloatingUpgrade } from "@/hooks/usage/use-trigger-floating-upgrade";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useConversationState } from "@/store/conversation/hooks";
import { useGlobalState } from "@/store/global/hooks";

interface Props {
  containerClassName?: string;
}

const renderUpgradeDescriptionSpan = (chunks: React.ReactNode) => (
  <span className="text-text-general-secondary">{chunks}</span>
);

export const FloatingUpgradeBlockListener: React.FC<Props> = ({
  containerClassName,
}) => {
  const { sendTrackingEvent } = useSendTrackingEvent();
  const conversationMode = useConversationState((state) => state.mode);
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const setDismissedFloatingBlock = useGlobalState(
    (state) => state.setDismissedFloatingBlock
  );
  const freeUsageResetInfo = useGlobalState(
    (state) => state.freeUsageResetInfo
  );
  const products = useGlobalState((state) => state.products);
  const userInfo = useGlobalState((state) => state.user);
  const chatFreeUsage = useGlobalState((state) => state.chatFreeUsage);
  const mainLayoutT = useTranslations("mainLayout");

  // Remote Config
  const { enabled: isFreeUserUsageEnabled } = useFreeUsageConfig();

  const isValidPremiumUser = useGlobalState(
    (state) => state.userSubscriptionInfo.isValidPremiumUser
  );
  const { floatingBlockVisible, isInitializing, reachMaximum } =
    useTriggerFloatingUpgrade(
      conversationMode,
      conversationMode === EConversationMode.CHAT
    );

  const handleCloseFloatingBlock = () => {
    setDismissedFloatingBlock();
  };
  const handleUpgradeFloatingBlock = () => {
    sendTrackingEvent({
      name: EventKeys.NewUpgradeClick,
      payload: {
        trigger: "home_page",
        ...(userInfo.id ? { vulcan_user_id: userInfo.id } : {}),
      },
    });
    setIsOpenSubscriptionModal(true, "bottom_block");
  };

  const upgradeContent = () => {
    const hasRemainingMessages = chatFreeUsage.chat > 0;
    const chatReset = freeUsageResetInfo.chat;
    const hitDailyLimit =
      chatFreeUsage.chat === 0 &&
      chatReset?.isWithinPeriod &&
      !chatReset?.isLastDayOfPeriod;

    if (hitDailyLimit && isFreeUserUsageEnabled) {
      return {
        description: mainLayoutT.rich(
          "floatingUpgradeBlock.hitDailyLimit.description",
          {
            span: renderUpgradeDescriptionSpan,
          }
        ),
        title: mainLayoutT("floatingUpgradeBlock.hitDailyLimit.title"),
      };
    }

    if (hasRemainingMessages) {
      return {
        description: mainLayoutT(
          "floatingUpgradeBlock.hasRemainingMessages.description"
        ),
        title: mainLayoutT("floatingUpgradeBlock.hasRemainingMessages.title", {
          usage: chatFreeUsage.chat,
        }),
      };
    }

    return {
      description: mainLayoutT(
        "floatingUpgradeBlock.greatProgress.description"
      ),
      title: mainLayoutT("floatingUpgradeBlock.greatProgress.title"),
    };
  };

  const bestSubscription = useMemo(
    () => productUseCases().getBestSubscriptionPackage(products),
    [products]
  );

  if (isValidPremiumUser || isInitializing) {
    return null;
  }
  if (!floatingBlockVisible) {
    return null;
  }

  return (
    <div className="pt-small-1 relative mx-auto w-full max-w-(--breakpoint-md)">
      <FloatingUpgradeBlock
        containerClassname={containerClassName}
        onUpgrade={handleUpgradeFloatingBlock}
        onClose={handleCloseFloatingBlock}
        title={upgradeContent().title}
        description={upgradeContent().description}
        hideCloseIcon={reachMaximum}
        product={bestSubscription}
      />
    </div>
  );
};
