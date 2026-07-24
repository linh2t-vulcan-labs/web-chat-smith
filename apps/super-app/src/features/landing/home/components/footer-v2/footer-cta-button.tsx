"use client";

import { useTranslations } from "next-intl";

import { useRouter } from "@/i18n/navigation";
import { TRACKING_ELEMENT_ID } from "@/libs/tracking-event/elements";
import { LOGIN_PAGE_URL } from "@/utils/constants/url";

import { ButtonAnimationV2 } from "../button-animation-v2";

export function FooterCtaButton() {
  const router = useRouter();

  const landingPageT = useTranslations("landingPage");

  return (
    <ButtonAnimationV2
      size="large"
      className="text-text-highlight h-[56px] min-w-[246px] bg-[linear-gradient(85deg,rgba(0,167,126,0.05)_-0.26%,rgba(119,255,250,0.04)_68.15%,rgba(107,255,112,0.05)_93.36%)] pt-[14px] font-semibold! uppercase"
      onClick={() => router.push(LOGIN_PAGE_URL)}
      id={TRACKING_ELEMENT_ID.LANDING_PAGE.UNLOCK_AI_POWER}
    >
      {landingPageT("footer.CTA")}
    </ButtonAnimationV2>
  );
}
