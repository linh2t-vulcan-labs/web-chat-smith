"use client";

import { useTranslations } from "next-intl";
import React from "react";

import { useRouter } from "@/i18n/navigation";
import { TRACKING_ELEMENT_ID } from "@/libs/tracking-event/elements";
import { DISCORD_COMMUNITY } from "@/utils/constants/url";

import { ButtonAnimationV2 } from "../button-animation-v2";

const JoinCommunityButton = () => {
  const t = useTranslations("landingPage");
  const router = useRouter();

  return (
    <ButtonAnimationV2
      className="px-small-0.5 text-bodyM text-text-highlight md:px-small-0.75 z-20 h-[48px] w-full bg-[linear-gradient(85deg,rgba(0,167,126,0.05)_-0.26%,rgba(119,255,250,0.04)_68.15%,rgba(107,255,112,0.05)_93.36%)] font-light! tracking-tight md:h-[56px] md:min-w-[305px] md:tracking-normal"
      style={{
        backdropFilter: "blur(16px)",
        background:
          "linear-gradient(85deg, rgba(0, 167, 126, 0.05) -0.26%, rgba(119, 255, 250, 0.04) 68.15%, rgba(107, 255, 112, 0.05) 93.36%)",
        boxShadow: "0 4px 52px 0 rgba(24, 136, 167, 0.90)",
      }}
      onClick={() => router.push(DISCORD_COMMUNITY)}
      id={TRACKING_ELEMENT_ID.LANDING_PAGE.COMMUNITY}
    >
      {t("community.CTA")}
    </ButtonAnimationV2>
  );
};

export default JoinCommunityButton;
