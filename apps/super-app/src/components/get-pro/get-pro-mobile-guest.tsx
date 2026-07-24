"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

import { Button } from "@/components/button-ds";
import { SvgIcon } from "@/components/svg-icon-ds";
import { useFeatureGating } from "@/features/guest-mode/hooks/use-feature-gating";
import { useGuestState } from "@/features/guest-mode/stores/guest-mode/hooks";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";

const GET_PRO_BG_IMAGE = "/images-v2/get-pro-bg-mobile.png";

const GetProMobileGuest = () => {
  const { openSubscriptionModal } = useFeatureGating();
  const { sendTrackingEvent } = useSendTrackingEvent();
  const guestId = useGuestState((state) => state.anonId);

  const tCommon = useTranslations("common");

  const handleClickGetPro = () => {
    openSubscriptionModal();
    sendTrackingEvent({
      name: EventKeys.NewUpgradeClick,
      payload: { guest_id: guestId || "", trigger: "nav_bar" },
    });
  };

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
          <div className="gap-v1-structural-content-tight flex flex-col">
            <span className="text-v1-level-gold-text typo-v1-body-default-normal">
              {tCommon("unlockAllFeature")}!
            </span>
          </div>
          <Button
            variant="gold"
            size="xs"
            className="rounded-circle text-v1-action-icon-gold px-v1-structural-component-micro! w-max"
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

export default GetProMobileGuest;
