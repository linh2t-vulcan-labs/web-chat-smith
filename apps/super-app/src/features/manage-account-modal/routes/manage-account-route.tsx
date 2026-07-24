"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { LoadingProcessing } from "@/components/loading-icon";
import ManageAccountModal from "@/features/manage-account-modal/manage-account-modal";
import { EManageAccountModalTab } from "@/features/manage-account-modal/types";
import { useIsEnablePaddleCheckout } from "@/hooks/remote-config/use-enable-paddle-checkout";
import { useRouter } from "@/i18n/navigation";
import { useGlobalState } from "@/store/global/hooks";
import { CONVERSATION_URL, MANAGE_ACCOUNT_URL } from "@/utils/constants/url";

import { useHandleManageSubscriptionMechanism } from "../hooks/use-handle-manage-subscription-mechanism";

type ManageAccountRouteProps = Readonly<{
  tabSegment?: string;
  isPageRoute?: boolean;
}>;

const NOT_FOUND_URL = "/404";
const DEFAULT_TAB = EManageAccountModalTab.GENERAL;

/**
 * Returns valid tabs based on subscription mechanism
 */
const getValidTabs = (
  isInlineManageSubscriptionMechanism: boolean
): string[] => {
  const allTabs = Object.values(EManageAccountModalTab);
  return isInlineManageSubscriptionMechanism
    ? allTabs
    : allTabs.filter((tab) => tab !== EManageAccountModalTab.MY_PLAN);
};

/**
 * Normalizes and validates tab segment from URL
 */
const normalizeTabSegment = (
  tabSegment: string | undefined,
  validTabs: string[]
): EManageAccountModalTab => {
  if (!tabSegment) {
    return DEFAULT_TAB;
  }

  const normalizedSegment = tabSegment.toLowerCase();
  return validTabs.includes(normalizedSegment)
    ? (normalizedSegment as EManageAccountModalTab)
    : DEFAULT_TAB;
};

function ManageAccountRoute({
  tabSegment,
  isPageRoute,
}: ManageAccountRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isCurrentSubscriptionFromMobile = useGlobalState(
    (state) => state.userSubscriptionInfo.isCurrentSubscriptionFromMobile
  );
  const {
    isPaddleManageSubscriptionMechanism,
    isInlineManageSubscriptionMechanism,
    isReady,
  } = useHandleManageSubscriptionMechanism();
  const isEnablePaddleCheckoutFeature = useIsEnablePaddleCheckout();

  const isOnManageAccountRoute = pathname.includes(MANAGE_ACCOUNT_URL);

  const validTabs = useMemo(() => {
    // Remote config (and thus `isInlineManageSubscriptionMechanism`) defaults
    // to its "not ready" value before `isReady`, which would otherwise filter
    // out MY_PLAN and flash the modal to GENERAL before flipping back once
    // config resolves. Trust the URL's tab segment until config is ready
    // instead of assuming the restrictive default.
    if (!isReady) {
      return Object.values(EManageAccountModalTab);
    }
    return getValidTabs(
      isInlineManageSubscriptionMechanism && isEnablePaddleCheckoutFeature
    );
  }, [
    isReady,
    isInlineManageSubscriptionMechanism,
    isEnablePaddleCheckoutFeature,
  ]);

  const initialTab = useMemo(
    () => normalizeTabSegment(tabSegment, validTabs),
    [tabSegment, validTabs]
  );

  const [activeTab, setActiveTab] =
    useState<EManageAccountModalTab>(initialTab);
  const [isNavigating, setIsNavigating] = useState(false);

  // Sync activeTab when initialTab changes
  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- resyncs local activeTab when the URL-derived initialTab changes; this mirrors a controlled/uncontrolled tab pattern that would need a broader refactor to make compiler-safe
    setActiveTab(initialTab);
  }, [initialTab]);

  // Redirect to 404 if subscription mechanism is invalid
  useEffect(() => {
    if (isReady && !isPaddleManageSubscriptionMechanism) {
      router.replace(NOT_FOUND_URL);
    }
  }, [isReady, isPaddleManageSubscriptionMechanism, router]);

  // Redirect to 404 if vender is invalid: check later
  // Note: GU-1134
  // useEffect(() => {
  //   if (isReady && paymentVendorOfSubscriptionUser === "stripe") {
  //     router.replace(NOT_FOUND_URL);
  //   }
  // }, [isReady, paymentVendorOfSubscriptionUser, router]);

  // Reset navigation state when route changes
  useEffect(() => {
    if (isNavigating && !isOnManageAccountRoute) {
      // oxlint-disable-next-line react/react-compiler -- clears navigating flag once the route confirms we've left the manage-account route; synchronizing with router navigation, not a render derivation
      setIsNavigating(false);
    }
  }, [isNavigating, isOnManageAccountRoute]);

  const handleTabChange = useCallback((tab: EManageAccountModalTab) => {
    setActiveTab(tab);
    globalThis.window.history.replaceState(
      null,
      "",
      `${MANAGE_ACCOUNT_URL}/${tab}`
    );
  }, []);

  const handleClose = useCallback(() => {
    if (isPageRoute) {
      setIsNavigating(true);
      router.replace(CONVERSATION_URL);
    } else {
      router.back();
    }
  }, [isPageRoute, router]);

  return (
    <>
      <LoadingProcessing isSpinning={isNavigating} />
      <ManageAccountModal
        open={isOnManageAccountRoute}
        isShowManageSubscription={!isCurrentSubscriptionFromMobile}
        onClose={handleClose}
        activeTab={activeTab}
        onChangeTab={handleTabChange}
      />
    </>
  );
}

export default ManageAccountRoute;
