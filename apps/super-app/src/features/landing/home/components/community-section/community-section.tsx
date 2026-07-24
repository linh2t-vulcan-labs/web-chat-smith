"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import React from "react";

import { compositeStyles } from "@/utils/commons/styles";

import { OverlaySectionBottom, OverlaySectionTop } from "../overlay-section";
import SectionBackground from "../what-you-get/section-background";

import styles from "./styles.module.scss";

const JoinCommunityButton = dynamic(() => import("./join-community-button"), {
  ssr: false,
});

const COMMUNITY_BG_URL = `/images/landing-page-v2/background/community-background.png`;

const renderBreakMobile = () => <br className="md:hidden" />;

const CommunitySection = () => {
  const t = useTranslations("landingPage");
  const subtitle = t.rich("community.subtitle", {
    breakMobile: renderBreakMobile,
  });

  return (
    <div className="pb-medium-3 pt-large-5 md:pb-large-4 md:pt-large-10 relative w-full overflow-x-hidden">
      <SectionBackground
        backgroundImageUrl={COMMUNITY_BG_URL}
        backgroundImageMobileUrl={COMMUNITY_BG_URL}
        threshold={0.2}
        className="bg-position-[center_5px]! 2xl:bg-position-[center_-120px]!"
      />
      <OverlaySectionTop />
      <OverlaySectionBottom />

      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="mx-auto lg:max-w-7xl">
          <div className="mb-medium-3 gap-medium-1.5 px-medium-2 md:mb-small-1 flex flex-col items-center">
            <h5 className="text-app-title-0 md:text-Heading-h2 font-normal! text-white/75">
              {t("community.title")}
            </h5>
            <p className="md:text-Body- text-bodyM text-center text-white/80">
              {subtitle}
            </p>
          </div>
          <div className="relative w-full">
            <div className="absolute inset-0 z-10 bg-[url('/images/landing-page-v2/community-bg.png')] bg-size-[86%] bg-center bg-no-repeat md:bg-size-[91%]" />

            <div className="community-border relative">
              <div
                className={compositeStyles(
                  "p-medium-2 md:p-large-4 block",
                  styles["community-border-line"]
                )}
              >
                <div className="rounded-line rounded-circle thickness-thin p-medium-2.5 md:p-large-4 border-dashed border-[#32CAC666]">
                  <div className="rounded-line rounded-circle thickness-thin p-medium-2.5 md:p-large-4 border-dashed border-[#32CAC699]">
                    <div className="rounded-line rounded-circle thickness-thin p-medium-2.5 md:p-large-4 border-dashed border-[#32CAC6CC]">
                      <JoinCommunityButton />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitySection;
