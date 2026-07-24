import { AnimatePresence, motion } from "motion/react";
import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import { VisuallyHidden } from "radix-ui";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/button-ds";
import { LoadingProcessing } from "@/components/loading-icon";
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/sheet";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";
import { useIsEnablePaddleCheckout } from "@/hooks/remote-config/use-enable-paddle-checkout";

import { useHandleManageSubscriptionMechanism } from "./hooks/use-handle-manage-subscription-mechanism";
import { ManageAccountSidebar } from "./sidebar";
import { EManageAccountModalTab } from "./types";

type AnimatedTabContentProps = Readonly<{
  tabKey: string;
  children: ReactNode;
}>;

type TManageAccountSheetContentProps = Readonly<{
  activeTab: EManageAccountModalTab;
  onTabChange: (tab: EManageAccountModalTab) => void;
  onClose?: () => void;
}>;

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

// Track if sheet has been opened in this session to skip animation on tab navigation
let hasSheetBeenOpened = false;

export default function ManageAccountSheetContent(
  props: TManageAccountSheetContentProps
) {
  const { activeTab, onTabChange, onClose } = props;
  const skipAnimation = useRef(hasSheetBeenOpened);

  const mainLayoutT = useTranslations("mainLayout");

  const { isInlineManageSubscriptionMechanism } =
    useHandleManageSubscriptionMechanism();
  const isEnablePaddleCheckoutFeature = useIsEnablePaddleCheckout();
  useEffect(() => {
    // Mark sheet as opened after initial animation completes
    const timer = setTimeout(() => {
      hasSheetBeenOpened = true;
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    hasSheetBeenOpened = false;
    skipAnimation.current = false;
    onClose?.();
  };

  return (
    <SheetContent
      side="bottom"
      className={cn(
        // oxlint-disable-next-line react/react-compiler -- reads skipAnimation.current during render to conditionally suppress the sheet's entrance animation on first open
        `rounded-tl-v1-2xl rounded-tr-v1-2xl flex h-full max-h-[calc(100vh-54px)] flex-col overflow-y-auto ${skipAnimation.current ? "animate-none! transition-none! duration-0!" : ""}`
      )}
    >
      <SheetHeader
        className={cn(
          "py-v1-structural-content-tight pr-v1-structural-content-tight flex w-full flex-row items-center text-left"
        )}
      >
        <SheetTitle className="py-v1-optical-normal px-v1-structural-content-relaxed flex-1">
          {mainLayoutT("header.userInfo.manageAccount")}
        </SheetTitle>
        <VisuallyHidden.Root asChild>
          <SheetDescription />
        </VisuallyHidden.Root>
        <SheetClose asChild>
          <Button variant="utility" iconOnly size="s" onClick={handleClose}>
            <SvgIcon
              name="x"
              size={24}
              className="text-v1-icon-hierarchy-tertiary"
            />
          </Button>
        </SheetClose>
      </SheetHeader>
      <div className="no-scrollbar px-v1-structural-content-relaxed py-v1-structural-content-tight flex items-center overflow-x-auto overflow-y-hidden">
        <ManageAccountSidebar
          activeTab={activeTab}
          isDesktop={false}
          onTabChange={onTabChange}
        />
      </div>
      <div className="p-v1-structural-content-relaxed h-full flex-1 overflow-y-auto">
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
    </SheetContent>
  );
}
