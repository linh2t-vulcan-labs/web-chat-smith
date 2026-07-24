"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";

import { SVGIcon } from "@/components/svg-icon";
import { Link } from "@/i18n/navigation";
import { TRACKING_ELEMENT_ID } from "@/libs/tracking-event/elements";
import { compositeStyles } from "@/utils/commons/styles";
import { LOGIN_PAGE_URL } from "@/utils/constants/url";

import { ButtonV3 } from "../button-v3";
import { CTATextAnimation } from "../cta-text-animation";
import { LazyInView } from "../lazy-in-view";

import styles from "./styles.module.scss";

const ChatCTASection = () => {
  const t = useTranslations("landingPage");
  const commonT = useTranslations("common");
  const [isActive, setIsActive] = useState(false);

  const handleToggleSearch = () => {
    setIsActive(!isActive);
  };

  return (
    <div
      className="dark gap-medium-2 rounded-pill thickness-thin p-medium-1.5 mx-auto flex max-w-xl flex-col"
      data-theme="dark"
      style={{
        background: "rgba(255, 255, 255, 0.08)",
        borderColor: "rgba(255, 255, 255, 0.08)",
        colorScheme: "dark",
      }}
    >
      {/* Input Top */}
      <div className="px-small-1 flex flex-col">
        <div className="relative flex min-h-11 flex-col justify-center">
          <div style={{ height: 44, width: 201 }}>
            <LazyInView>
              <CTATextAnimation
                words={
                  isActive
                    ? [
                        commonT("webSearch"),
                        commonT("deepResearch"),
                        commonT("realTimeSearch"),
                      ]
                    : [t("stats.aiChat"), t("aiAir"), t("aiAnalytic")]
                }
              />
            </LazyInView>
          </div>
        </div>
      </div>
      <div className="mt-small-0.25 flex justify-between">
        <div className="gap-medium-1.5 flex">
          <button
            id="search-button"
            type="button"
            className="px-medium-1.25 flex size-9 cursor-default items-center justify-center rounded-full"
            style={{
              backdropFilter: "blur(60px)",
              border: "1.5px solid rgba(255, 255, 255, 0.04)",
              color: "rgb(244, 244, 244)",
            }}
          >
            <SVGIcon
              className="text-white/20"
              src="/images/landing-page-v2/icons/plus.svg"
              width={20}
              height={20}
            />
          </button>
          <button
            type="button"
            className={compositeStyles(
              "gap-small-0.75 px-medium-2 text-bodyM flex h-9 items-center justify-center rounded-full font-light! opacity-75",
              styles["search-button"],
              isActive && styles["search-button-active"],
              isActive && "text-text-highlight"
            )}
            onClick={handleToggleSearch}
            style={{
              backdropFilter: "blur(60px)",
              border: "1.5px solid rgba(255, 255, 255, 0.04)",
              color: "rgb(244, 244, 244)",
            }}
          >
            <SVGIcon
              className={compositeStyles(
                isActive ? "text-text-highlight" : "text-white"
              )}
              src="/images/landing-page-v2/icons/search.svg"
              width={16}
              height={16}
            />
            {t("search")}
          </button>
        </div>

        <Link
          id={TRACKING_ELEMENT_ID.LANDING_PAGE.CHAT_INPUT_CTA}
          href={LOGIN_PAGE_URL}
        >
          <ButtonV3
            className="flex size-[36px] items-center justify-center p-0!"
            color="teal"
          >
            <SVGIcon
              className="opacity-75"
              src="/images/landing-page-v2/icons/next.svg"
              width={16}
              height={16}
            />
          </ButtonV3>
        </Link>
      </div>
    </div>
  );
};

export default ChatCTASection;
