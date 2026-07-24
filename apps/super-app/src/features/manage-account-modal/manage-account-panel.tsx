"use client";

// import { IconsOutlinedClosedIcon } from "@cs/icons/icons-outlined-closed";
import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { LoadingProcessing } from "@/components/loading-icon";
import { SVGIcon } from "@/components/svg-icon/svg-icon";
import { cn } from "@/components/utils/cn";
import { useIsEnablePaddleCheckout } from "@/hooks/remote-config/use-enable-paddle-checkout";

import { useHandleManageSubscriptionMechanism } from "./hooks/use-handle-manage-subscription-mechanism";
import { ManageAccountSidebar } from "./sidebar";
import { EManageAccountModalTab } from "./types";

const GeneralTabSection = dynamic(
  () => import("./sections/general/general-tab"),
  {
    loading: () => <LoadingProcessing isSpinning />,
  }
);
const HelpCenterTabSection = dynamic(
  () => import("./sections/help-center/help-center-tab"),
  {
    loading: () => <LoadingProcessing isSpinning />,
  }
);
const MyPlanTabSection = dynamic(
  () => import("./sections/my-plan/my-plan-section"),
  {
    loading: () => <LoadingProcessing isSpinning />,
  }
);

type ManageAccountPanelProps = Readonly<{
  activeTab: EManageAccountModalTab;
  onTabChange: (tab: EManageAccountModalTab) => void;
  onClose?: () => void;
}>;

export default function ManageAccountPanel({
  activeTab,
  onTabChange,
  onClose,
}: ManageAccountPanelProps) {
  const mainLayoutT = useTranslations("mainLayout");
  const { isInlineManageSubscriptionMechanism } =
    useHandleManageSubscriptionMechanism();
  const isEnablePaddleCheckoutFeature = useIsEnablePaddleCheckout();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [activeTab]);

  return (
    <div className="gap-v1-structural-content-tight flex flex-col">
      <div
        className={cn(
          "text-text-general-primary flex w-full items-center",
          "py-v1-structural-component-medium pl-v1-structural-section-compact"
        )}
      >
        <h3 className="text-Heading-h3 text-heading-scale-2 flex-1">
          {mainLayoutT("header.userInfo.manageAccount")}
        </h3>
        {onClose ? (
          <SVGIcon
            src="/icons/outlined/closed.svg"
            className="p-v1-structural-component-medium cursor-pointer hover:brightness-75"
            width={24}
            height={24}
            onClick={onClose}
          />
        ) : null}
      </div>
      <div className="gap-small-0.5 flex w-full md:gap-0">
        <div className="ps-v1-structural-section-compact min-w-56">
          <ManageAccountSidebar
            activeTab={activeTab}
            isDesktop={true}
            onTabChange={onTabChange}
          />
        </div>
        <div
          ref={scrollRef}
          className="w-full overflow-x-hidden overflow-y-auto md:max-h-129.5"
        >
          <div className="gap-large-4 pb-large-4 px-v1-structural-section-compact flex min-h-130.5 w-full flex-col">
            <AnimatePresence mode="wait">
              {activeTab === EManageAccountModalTab.GENERAL && (
                <AnimatedTabContent tabKey="general">
                  <GeneralTabSection />
                </AnimatedTabContent>
              )}
              {isInlineManageSubscriptionMechanism &&
                isEnablePaddleCheckoutFeature &&
                activeTab === EManageAccountModalTab.MY_PLAN && (
                  <AnimatedTabContent tabKey="my-plan">
                    <MyPlanTabSection />
                  </AnimatedTabContent>
                )}
              {activeTab === EManageAccountModalTab.HELP_CENTER && (
                <AnimatedTabContent tabKey="help-center">
                  <HelpCenterTabSection />
                </AnimatedTabContent>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

type AnimatedTabContentProps = Readonly<{
  tabKey: string;
  children: ReactNode;
}>;

function AnimatedTabContent({ tabKey, children }: AnimatedTabContentProps) {
  return (
    <motion.div
      key={tabKey}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}
