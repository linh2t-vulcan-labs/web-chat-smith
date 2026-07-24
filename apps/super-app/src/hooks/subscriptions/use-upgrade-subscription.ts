import { useMemo } from "react";

import { productUseCases } from "@/core/usecases/product";
import type { TDSSource } from "@/libs/tracking-event";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import type { TPurchaseSource } from "@/utils/commons/types";

export const useUpgradeSubscription = () => {
  const isFinishFetchProfile = useGlobalState(
    (state) => state.isFinishFetchProfile
  );
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const { sendTrackingEvent } = useSendTrackingEvent();
  const products = useGlobalState((state) => state.products);

  const dsVersion = useGlobalState((state) => state.dsVersion);
  const userId = useGlobalState((state) => state.user.id);
  const bestSubscription = useMemo(
    () => productUseCases().getBestSubscriptionPackage(products),
    [products]
  );

  const { isValidPremiumUser } = userSubscriptionInfo;

  const onClickUpgrade = (
    eventSource: TDSSource,
    purchaseSource?: TPurchaseSource
  ) => {
    setIsOpenSubscriptionModal(true, purchaseSource);
    sendTrackingEvent({
      name: EventKeys.DSOpen,
      payload: {
        ds_version: dsVersion,
        vulcan_source: eventSource,
        vulcan_user_id: userId,
      },
    });
  };

  return {
    bestSubscription,
    isLoading: !isFinishFetchProfile,
    isShowUpgrade: !isValidPremiumUser && isFinishFetchProfile,
    onClickUpgrade,
  };
};
