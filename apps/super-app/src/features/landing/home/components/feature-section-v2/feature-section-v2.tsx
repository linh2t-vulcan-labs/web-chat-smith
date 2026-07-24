"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import React, { useMemo, useRef, useState } from "react";

import { SVGIcon } from "@/components/svg-icon";
import { LANDING_SECTION } from "@/config/landing-page";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRouter } from "@/i18n/navigation";
import { debounce } from "@/libs/lodash-es";
import type { TSanityHomePage } from "@/libs/sanity";
import { TRACKING_ELEMENT_ID } from "@/libs/tracking-event/elements";
import { compositeStyles } from "@/utils/commons/styles";
import { LOGIN_PAGE_URL } from "@/utils/constants/url";

import { FEATURE_DATA_ICONS } from "../../constants/data";
import { OverlaySectionTop } from "../overlay-section";
import FeatureBackground from "./feature-background";
import FeatureCard from "./feature-card";

const FeatureCarousel = dynamic(() => import("./feature-carousel"), {
  loading: () => (
    <div className="mt-large-4 ps-medium-2">
      <div className="flex gap-6">
        <div className="w-full">
          <div className="h-64" />
        </div>
      </div>
    </div>
  ),
  ssr: false,
});

const FeatureSectionV2 = ({ data }: { data: TSanityHomePage }) => {
  const { features } = data;
  const [shouldShowOverlay, setShouldShowOverlay] = useState(false);
  const isDesktop = useMediaQuery("md");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const t = useTranslations("landingPage");
  const router = useRouter();

  const debouncedSetOverlay = debounce((isOverlay: boolean) => {
    if (isOverlay) {
      setShouldShowOverlay(true);
    } else {
      setShouldShowOverlay(false);
    }
  }, 100);

  const handleScreenWidthChange = (width: number) => {
    debouncedSetOverlay(width > 1792);
  };

  const moreFeatureItem = useMemo(
    () => features?.items.find((item) => item.isMore),
    [features]
  );

  return (
    <section className="relative w-full" id={LANDING_SECTION.FEATURE}>
      <div
        className={compositeStyles(
          "relative mx-auto w-full max-w-[1920px] py-large-5 md:py-large-10"
        )}
      >
        <FeatureBackground
          buttonRef={buttonRef}
          onScreenWidthChange={handleScreenWidthChange}
        />
        <OverlaySectionTop />
        <div className="overlay-bottom absolute inset-0 bg-[linear-gradient(to_top,#0A0A0A_0%,rgba(10,10,10,1)_35%,transparent_60%)]" />
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-large-4 md:gap-large-6">
            {/* Header */}
            <div className="flex flex-col items-center gap-medium-1.5 px-medium-2 opacity-75">
              <h2 className="text-center text-app-title-0 font-normal text-white/75 md:text-Heading-h2">
                {features?.title || ""}
              </h2>
              <p className="text-center text-bodyM text-white/80 md:text-Body-l">
                {features?.subtitle || ""}
              </p>
            </div>
            {/* Body */}
            {/* CTA Fake Button */}
            <div className="self-center">
              <button
                ref={buttonRef}
                type="button"
                className="size-[64px] cursor-default rounded-full px-medium-2"
                style={{
                  backdropFilter: "blur(60px)",
                  backgroundColor: "rgba(144, 255, 228, 0.04)",
                  border: "1.5px solid rgba(144, 255, 228, 0.12)",
                }}
              >
                <SVGIcon
                  className="text-text-highlight opacity-50"
                  src="/images/landing-page-v2/icons/plus.svg"
                  width={32}
                  height={32}
                />
              </button>
            </div>
            {isDesktop ? (
              <div className="grid grid-cols-2 gap-large-4 px-medium-2 lg:grid-cols-3">
                {features?.items
                  ?.filter((item) => !item?.isMore)
                  ?.map((feature, idx) => (
                    <FeatureCard
                      key={idx.toString()}
                      title={feature.name || ""}
                      description={feature.description || ""}
                      btnText={t("feature.CTA")}
                      icon={FEATURE_DATA_ICONS[idx % 5]}
                      onButtonClick={() => router.push(LOGIN_PAGE_URL)}
                      btnId={feature.btnId || ""}
                    />
                  ))}
                {moreFeatureItem && (
                  <FeatureCard
                    title={moreFeatureItem.name || ""}
                    description={moreFeatureItem.description || ""}
                    btnText={t("feature.discoverCTA")}
                    horizontalCentered={true}
                    onButtonClick={() => router.push(LOGIN_PAGE_URL)}
                    btnId={TRACKING_ELEMENT_ID.LANDING_PAGE.TRY_NOW_DISCOVER}
                  />
                )}
              </div>
            ) : (
              <div className="relative w-full ps-medium-2 rtl:pr-medium-2">
                <FeatureCarousel featureData={features?.items || []} />
              </div>
            )}
          </div>
        </div>

        {/* Overlay sections to blend the background on both sides - only visible on screens > 1792px */}
        {shouldShowOverlay && (
          <>
            <div className="overlay-section-left absolute inset-0 bg-[linear-gradient(to_right,rgba(10,10,10,1)_0%,rgba(10,10,10,0.8)_20%,rgba(10,10,10,0.4)_30%,transparent_40%)]" />
            <div className="overlay-section-right absolute inset-0 bg-[linear-gradient(to_left,rgba(10,10,10,1)_0%,rgba(10,10,10,0.8)_20%,rgba(10,10,10,0.4)_30%,transparent_40%)]" />
          </>
        )}
      </div>
    </section>
  );
};

export default FeatureSectionV2;
