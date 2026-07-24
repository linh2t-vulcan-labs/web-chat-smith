import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

import { Button } from "@/components/button-ds";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { SvgIcon } from "@/components/svg-icon-ds";
import { useUpgradeSubscription } from "@/hooks/subscriptions";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";

import { GetProBanner } from "../../get-pro-banner";

const GET_PRO_BG_IMAGE = "/images-v2/pro-bg.png";

function GetProDesktop() {
  const { isShowUpgrade, bestSubscription } = useUpgradeSubscription();
  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const userId = useGlobalState((state) => state.user.id);
  const dsVersion = useGlobalState((state) => state.dsVersion);
  const { sendTrackingEvent } = useSendTrackingEvent();

  const tCommon = useTranslations("common");
  const perWeek = tCommon("perDuration", {
    duration: tCommon("duration.week"),
  });

  const handleClickGetPro = () => {
    setIsOpenSubscriptionModal(true, "banner");
    if (userId) {
      sendTrackingEvent({
        name: EventKeys.DSOpen,
        payload: {
          ds_version: dsVersion,
          vulcan_source: "banner",
          vulcan_user_id: userId,
        },
      });
      sendTrackingEvent({
        name: EventKeys.NewUpgradeClick,
        payload: { trigger: "sidebar", vulcan_user_id: userId },
      });
    }
  };

  if (!isShowUpgrade) {
    return null;
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="gold"
          size="l"
          className="text-v1-action-icon-gold w-max"
          iconOnly
          prefixIcon={<SvgIcon name="gold" size={24} />}
        />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={33}
        className="rounded-v1-xl p-v1-structural-content-relaxed border-v1-border-structural-subtle relative z-99 flex w-[284px] flex-col items-center overflow-hidden border-4"
      >
        <Image
          src={GET_PRO_BG_IMAGE}
          alt=""
          fill
          priority
          sizes="284px"
          className="pointer-events-none object-cover"
        />
        <div className="relative z-10 w-full">
          <GetProBanner
            price={bestSubscription?.pricePerWeek}
            perWeekLabel={perWeek}
            upgradeText={tCommon("upgradeNow")}
            onUpgrade={handleClickGetPro}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default GetProDesktop;
