import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

import { Button } from "@/components/button-ds";
import { SvgIcon } from "@/components/svg-icon-ds";
import { useUpgradeSubscription } from "@/hooks/subscriptions";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";

const GET_PRO_BG_IMAGE = "/images-v2/get-pro-bg-mobile.png";

const GetProMobile = () => {
  const { isShowUpgrade } = useUpgradeSubscription();
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const userId = useGlobalState((state) => state.user.id);
  const dsVersion = useGlobalState((state) => state.dsVersion);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const tCommon = useTranslations("common");

  const handleClickGetPro = () => {
    setIsOpenSubscriptionModal(true, "banner");
    if (userId) {
      sendTrackingEvent({
        name: EventKeys.NewUpgradeClick,
        payload: { trigger: "sidebar", vulcan_user_id: userId },
      });
      sendTrackingEvent({
        name: EventKeys.DSOpen,
        payload: {
          ds_version: dsVersion,
          vulcan_source: "banner",
          vulcan_user_id: userId,
        },
      });
    }
  };

  if (!isShowUpgrade) {
    return null;
  }
  return (
    <div className="gap-v1-structural-section-compact rounded-v1-pill px-v1-structural-content-relaxed py-v1-structural-content-normal relative flex flex-col items-start overflow-hidden">
      <Image
        src={GET_PRO_BG_IMAGE}
        alt=""
        fill
        priority
        sizes="(max-width: 768px) 100vw, 374px"
        className="pointer-events-none object-cover"
      />
      <div className="gap-v1-structural-section-compact relative z-10 flex w-full flex-col items-center">
        <div className="flex w-full items-center justify-between">
          <span className="text-v1-level-gold-text typo-v1-body-default-normal">
            {tCommon("unlockAllFeature")}!
          </span>
          <Button
            variant="gold"
            size="xs"
            className="text-v1-action-icon-gold px-v1-structural-component-micro! w-max"
            iconOnly
            prefixIcon={<SvgIcon name="gold" size={16} />}
            onClick={handleClickGetPro}
          >
            {tCommon("getProV2")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GetProMobile;
