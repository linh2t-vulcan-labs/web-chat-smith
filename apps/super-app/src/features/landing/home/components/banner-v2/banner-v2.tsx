"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useMemo } from "react";

import { Link } from "@/i18n/navigation";
import type { TSanityHomePage } from "@/libs/sanity";
import { TRACKING_ELEMENT_ID } from "@/libs/tracking-event/elements";
import { compositeStyles } from "@/utils/commons/styles";
import { HERO_BANNER_DESKTOP_URL } from "@/utils/constants/cdn";
import { LOGIN_PAGE_URL } from "@/utils/constants/url";

import { useBannerAnimation } from "../../hooks/use-banner-animation";
import { ButtonAnimationV2 } from "../button-animation-v2";
import { ChatCTASection } from "../chat-cta-section";
import { HighlightText } from "../highlight-text";
import { OverlaySectionBottom } from "../overlay-section";
import { ACHIEVEMENTS_DATA } from "./consts";
import MobileAppDownloadV2 from "./mobile-app-download-v2";

import styles from "./styles.module.scss";

const BannerPlaceholderUrl =
  "/images/landing-page-v2/background/hero-bg-placeholder.png";

function BannerV2({ data }: { data: TSanityHomePage }) {
  const { appStoreLink, chPlayLink, hero } = data;
  const { isVideoVisible, shouldLoadAnimated, bannerRef, videoRef } =
    useBannerAnimation();
  const BannerURL = HERO_BANNER_DESKTOP_URL();
  const t = useTranslations("landingPage");

  // Optimize video loop - automatically restart when finished instead of using loop attribute
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !shouldLoadAnimated) {
      return;
    }

    const handleEnded = async () => {
      // Reset to the beginning and play again - more efficient than loop attribute
      video.currentTime = 0;
      if (isVideoVisible) {
        try {
          await video.play();
        } catch {
          // Ignore playback errors (e.g. autoplay blocked)
        }
      }
    };

    // Reduce frame rate when not in focus to save CPU
    const handleVisibilityChange = async () => {
      if (document.hidden && video) {
        video.pause();
      } else if (!document.hidden && isVideoVisible && video) {
        try {
          await video.play();
        } catch {
          // Ignore playback errors (e.g. autoplay blocked)
        }
      }
    };

    video.addEventListener("ended", handleEnded);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      video.removeEventListener("ended", handleEnded);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [shouldLoadAnimated, isVideoVisible, videoRef]);

  const achievementsData = useMemo(() => ACHIEVEMENTS_DATA, []);
  return (
    <div
      ref={bannerRef}
      className="relative flex flex-col items-center justify-start overflow-hidden md:h-full"
    >
      {/* Background Layer - simplified */}
      <div
        className={compositeStyles(styles["banner-overlay-background"])}
        style={{
          height: "100%",
          inset: 0,
          position: "absolute",
          width: "100%",
          zIndex: 0,
        }}
      >
        {/* Placeholder - ALWAYS visible, priority cho LCP */}
        <Image
          src={BannerPlaceholderUrl}
          alt="Chat Smith AI Assistant Banner"
          fill
          priority
          quality={100}
          sizes="100vw"
          placeholder="empty"
          style={{
            objectFit: "cover",
            objectPosition: "center",
            opacity: shouldLoadAnimated ? 0 : 1,
            transition: "opacity 0.8s ease-out",
          }}
        />

        {/* Animated background - load only when conditions permit */}
        {shouldLoadAnimated && (
          <video
            ref={videoRef}
            playsInline
            muted
            preload="metadata"
            poster={BannerPlaceholderUrl}
            // Performance optimizations
            disablePictureInPicture
            disableRemotePlayback
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              opacity: shouldLoadAnimated ? 1 : 0,
              transition: "opacity 0.8s ease-out",
              // GPU acceleration
              transform: "translateZ(0)",
              willChange: "auto",
            }}
            // DO NOT use loop attribute - control manually
            onLoadedData={async () => {
              if (videoRef.current && isVideoVisible) {
                try {
                  await videoRef.current.play();
                } catch {
                  // Ignore playback errors (e.g. autoplay blocked)
                }
              }
            }}
          >
            <source src={BannerURL} type="video/mp4" />
          </video>
        )}
      </div>

      <OverlaySectionBottom />

      {/* Content - inline critical styles to avoid CSS blocking */}
      <div
        className="gap-medium-3 px-medium-2 z-10 flex flex-col"
        style={{ position: "relative", zIndex: 10 }}
      >
        {/* Statistical */}
        <div className="p-medium-2 flex flex-col items-center">
          <div className="gap-medium-2 md:gap-large-4 flex">
            {achievementsData.map((achievement) => {
              const isSmallBlock =
                achievement.value.length < 4 && achievement.label.length < 8;
              return (
                <div
                  key={achievement.id}
                  className={compositeStyles(
                    "px-small-0.5 pb-small-0.5 md:px-medium-2 md:pb-small-0.25 w-max bg-cover bg-center bg-no-repeat",
                    isSmallBlock
                      ? "bg-[url(/images/landing-page-v2/double-leaf-small.png)]"
                      : "bg-[url(/images/landing-page-v2/double-leaf.png)]"
                  )}
                >
                  <div className="px-small-0.5 flex flex-col items-center md:gap-0">
                    <div
                      className={compositeStyles(
                        "gap-small-0.25 flex items-center",
                        isSmallBlock
                          ? "w-[64px] md:w-[72px]"
                          : "w-[82px] md:w-[95px]"
                      )}
                    >
                      <div className="text-title1 md:text-display-m w-full text-center font-bold text-white/75">
                        {achievement.prefix || null}
                        {achievement.value}
                        {achievement.suffix || null}
                      </div>
                    </div>
                    <div className="-mt-small-0.5 md:-mt-small-0.25 text-[8px] leading-[12px] font-bold! text-white/75 md:text-[10px] md:leading-[20px]">
                      {t(achievement.label)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <h1
          className="text-Heading-h3 md:text-Heading-h1 text-center text-[#D1FFFA]"
          style={{
            maxWidth: 866,
          }}
        >
          {hero?.title}
        </h1>

        <div className="gap-large-6 flex flex-col items-center">
          <p
            className="text-Body-l text-center text-white"
            style={{
              maxWidth: 500,
            }}
          >
            <HighlightText
              text={hero?.subtitle || ""}
              highlights={hero?.highlight?.split(",") || []}
            />
          </p>

          <Link href={LOGIN_PAGE_URL}>
            <ButtonAnimationV2
              size="large"
              className="text-bodyM text-text-highlight h-[56px] min-w-[207px] pt-[14px] font-medium uppercase"
              id={TRACKING_ELEMENT_ID.LANDING_PAGE.HERO_BANNER_CTA}
            >
              {hero?.cta || ""}
            </ButtonAnimationV2>
          </Link>

          <div className="flex w-full justify-center gap-x-4">
            <MobileAppDownloadV2
              appStoreLink={appStoreLink || ""}
              chPlayLink={chPlayLink || ""}
            />
          </div>
        </div>
        <div className="pt-large-10">
          <ChatCTASection />
        </div>
      </div>
    </div>
  );
}

export default BannerV2;
