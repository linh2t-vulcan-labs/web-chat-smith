"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { Icon } from "@/components/icon";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useAuthState } from "@/store/auth";
import { EAUTH_SOURCE } from "@/utils/commons/enums";

import type { TOAuthProviderV3Props } from "./types";

export default function OAuthProviderV3(props: TOAuthProviderV3Props) {
  const { provider, imageURL, imageLightURL, mode } = props;
  const { sendTrackingEvent } = useSendTrackingEvent();
  const signInWithProvider = useAuthState((state) => state.signInWithProvider);

  const t = useTranslations("loginPage.loginForm");
  const label = t("cta", {
    platform: provider.charAt(0).toUpperCase() + provider.slice(1),
  });

  const handleLogin = async () => {
    sendTrackingEvent({
      name: EventKeys.SignInStart,
      payload: {
        signin_method: provider,
        signin_source: EAUTH_SOURCE.DEFAULT,
      },
    });
    await signInWithProvider(provider);
  };
  const buttonStyles =
    mode === "mobile" ? {} : { background: "rgba(255, 255, 255, 0.08)" };
  return (
    <button
      data-testid={provider}
      className="rounded-default thickness-thin px-medium-2.5 py-medium-2 text-bodyS-highlight text-text-action-secondary-default inline-flex h-[52px] justify-center border-white/10 transition duration-300 ease-out md:border-black/10 dark:md:border-black/10"
      type="button"
      style={buttonStyles}
      onClick={handleLogin}
    >
      <div className="gap-x-medium-2 inline-flex w-full items-center justify-between">
        <span className="gap-medium-2 text-text-general-inverse md:text-text-general-primary dark:text-text-general-primary inline-flex w-full items-center">
          <div className="block md:hidden">
            <Image
              className="hidden md:block"
              src={imageLightURL}
              width={20}
              height={20}
              alt={provider}
            />
            <Image
              className="block md:hidden"
              src={imageURL}
              width={20}
              height={20}
              alt={provider}
            />
          </div>
          <div className="hidden md:block">
            <Image
              className="block dark:hidden"
              src={imageLightURL}
              width={20}
              height={20}
              alt={provider}
            />
            <Image
              className="hidden dark:block"
              src={imageURL}
              width={20}
              height={20}
              alt={provider}
            />
          </div>
          {label}
        </span>
        <Icon className="rtl:rotate-180" name="chevronRight" size={16} />
      </div>
    </button>
  );
}
