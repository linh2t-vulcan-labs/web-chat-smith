"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Link from "next/link";
import React from "react";

import { LANDING_SECTION } from "@/config/landing-page";
import type { TSanityHomePage } from "@/libs/sanity";
import { TRACKING_ELEMENT_ID } from "@/libs/tracking-event/elements";
import { LOGIN_PAGE_URL } from "@/utils/constants/url";

import { ButtonAnimationV2 } from "../button-animation-v2";
import { OverlaySectionBottom, OverlaySectionTop } from "../overlay-section";
import SectionBackground from "./section-background";

import styles from "./styles.module.scss";

const ComparePlan = dynamic(() => import("./compare-plan"), { ssr: false });

const WHAT_YOU_GET_BG_URL = `/images/landing-page-v2/background/what-you-get-bg.png`;
const WHAT_YOU_GET_MOBILE_BG_URL = `/images/landing-page-v2/background/what-you-get-bg-mobile.png`;

const WhatYouGet = ({ data }: { data: TSanityHomePage }) => {
  const { plan } = data;
  const t = useTranslations("landingPage");
  return (
    <div
      className="px-medium-2 py-large-5 md:py-large-10 relative"
      id={LANDING_SECTION.PLAN}
    >
      <SectionBackground
        backgroundImageUrl={WHAT_YOU_GET_BG_URL}
        backgroundImageMobileUrl={WHAT_YOU_GET_MOBILE_BG_URL}
        threshold={0.2}
      />
      <div className={styles["background-overlay"]} />
      <OverlaySectionTop />
      <OverlaySectionBottom />
      <div className="what-you-get relative z-10 mx-auto max-w-3xl">
        <h2 className="mb-large-4 text-app-title-0 md:mb-large-6 md:text-Heading-h2 lg:px-large-4 text-center font-normal! text-white/75">
          {plan?.title || ""}
        </h2>
        {/* Benefit */}
        <ComparePlan data={data} />
        {/* CTA Button */}
        <div className="mt-medium-3 py-medium-1.5 pt-small-0.5 md:mt-large-6 flex justify-center">
          <div className="backlight group relative inline-block">
            <div className="rounded-half bg-gradient-mint absolute inset-0 blur-[9px] transition-all group-hover:shadow-[0_4px_52px_0_rgba(24,136,167,0.90)] group-hover:blur-lg" />
            <Link
              id={TRACKING_ELEMENT_ID.LANDING_PAGE.PLAN_DISCOVER_CTA}
              href={LOGIN_PAGE_URL}
            >
              <ButtonAnimationV2
                size="small"
                className="px-large-4! text-Body-s! text-text-highlight h-[36px] bg-[rgba(0,20,30,1)] font-medium! uppercase"
              >
                {t("plan.CTA")}
              </ButtonAnimationV2>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatYouGet;
