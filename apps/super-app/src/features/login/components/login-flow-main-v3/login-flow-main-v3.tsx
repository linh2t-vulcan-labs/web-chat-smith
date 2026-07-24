"use client";

import { useTranslations } from "next-intl";
import dynamic from "next/dynamic";
import Image from "next/image";
import React from "react";

import { ModalV2 } from "@/components/modal";
import { LoginAiModel } from "@/features/login/components/login-ai-model";
import { LoginHero } from "@/features/login/components/login-hero";
import { parseAsBoolean, useQueryState } from "@/libs/nuqs";

import { LoginFormV3 } from "../login-form-v3";
import type { TLoginFlowMain } from "./types";

const MessageLoginPopup = dynamic(() => import("./message-login-popup"));

const renderTrustedByBrand = (chunks: React.ReactNode) => (
  <span className="text-text-general-brand-identity">{chunks}</span>
);

const renderTrustedByHighlight = (chunks: React.ReactNode) => (
  <span className="md:dark:text-text-general-secondary dark:text-text-general-primary text-text-general-inverse md:text-text-general-primary">
    {chunks}
  </span>
);

const renderBreak = () => <br />;

export default function LoginFlowMainV3({ status: _status }: TLoginFlowMain) {
  const [expireQuery] = useQueryState("token_expired", parseAsBoolean);
  const loginPageTranslate = useTranslations("loginPage");

  const trustedByHighlight = loginPageTranslate.rich("trustedByHighlight", {
    brand: renderTrustedByBrand,
    break: renderBreak,
    count: "43M+",
    highlight: renderTrustedByHighlight,
  });

  return (
    <ModalV2
      open
      isPreventClickOutside
      containerClassName="h-screen max-w-none lg:h-auto max-h-none lg:max-w-[1104px]! w-full inline-flex justify-center p-0 rounded-none lg:rounded-default items-start lg:items-center"
      className="bg-bg-login-form-mobile lg:rounded-default size-full overflow-y-auto bg-cover bg-center bg-no-repeat p-0! lg:overflow-y-hidden lg:bg-none"
    >
      <div className="z-10 flex w-full flex-col lg:flex-row">
        <div className="rounded-es-default rounded-ss-default bg-bg-login-card relative hidden w-full overflow-hidden bg-cover bg-center lg:flex lg:basis-[59.1%]">
          <LoginHero />
        </div>
        <div className="gap-large-4 px-medium-3 pb-large-4 pt-large-8 lg:p-large-6 flex w-full flex-col lg:basis-[40.9%]">
          <div className="gap-medium-3 flex flex-col lg:hidden">
            <LoginAiModel />
            <div className="gap-small-0.5 flex flex-col items-center justify-center">
              <Image
                src="/images/login/login-logo.png"
                alt="logo"
                width={52}
                height={52}
              />
              <span className="text-app-Title2 dark:text-text-general-secondary text-text-general-inverse">
                Chat Smith
              </span>
            </div>
          </div>

          {/* Login Badge */}
          <div className="flex flex-col items-center lg:items-start">
            <div className="bg-login-badge px-medium-3 pb-medium-1.5 pt-small-0.75 flex w-full items-center justify-center bg-contain bg-center bg-no-repeat lg:w-fit lg:justify-start">
              <div className="lg:px-small-1 flex flex-col items-center text-center">
                <div className="gap-small-0.25 flex items-center">
                  <div className="text-title1 md:dark:text-text-general-secondary dark:text-text-general-primary text-text-general-inverse md:text-text-general-primary font-semibold">
                    #1
                  </div>
                  <div className="text-footnoteS-neutral text-text-general-brand-identity leading-[10px] font-bold">
                    {loginPageTranslate.rich("aiChatPlatform", {
                      break: renderBreak,
                    })}
                  </div>
                </div>
                <div className="text-footnoteS-neutral text-text-general-secondary leading-[12px] font-semibold">
                  {trustedByHighlight}
                </div>
              </div>
            </div>
          </div>
          <LoginFormV3 />
        </div>
      </div>
      {expireQuery && <MessageLoginPopup open={true} />}
    </ModalV2>
  );
}
