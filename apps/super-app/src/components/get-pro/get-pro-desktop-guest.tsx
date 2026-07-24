import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useMemo } from "react";

import { Button } from "@/components/button-ds";
import { GetProBanner } from "@/components/get-pro-banner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import { SvgIcon } from "@/components/svg-icon-ds";
import { productUseCases } from "@/core/usecases/product";
import { useFeatureGating } from "@/features/guest-mode/hooks/use-feature-gating";
import { useGuestState } from "@/features/guest-mode/stores/guest-mode/hooks";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";

const GET_PRO_BG_IMAGE = "/images-v2/pro-bg.png";

const GetProDesktopGuest = () => {
  const products = useGlobalState((state) => state.products);
  const guestId = useGuestState((state) => state.anonId);
  const tCommon = useTranslations("common");
  const { sendTrackingEvent } = useSendTrackingEvent();
  const { openSubscriptionModal } = useFeatureGating();

  const perWeek = tCommon("perDuration", {
    duration: tCommon("duration.week"),
  });

  const handleClickGetPro = () => {
    openSubscriptionModal();
    sendTrackingEvent({
      name: EventKeys.NewUpgradeClick,
      payload: { guest_id: guestId || "", trigger: "nav_bar" },
    });
  };

  const bestSubscription = useMemo(
    () => productUseCases().getBestSubscriptionPackage(products),
    [products]
  );

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
};

export default GetProDesktopGuest;
