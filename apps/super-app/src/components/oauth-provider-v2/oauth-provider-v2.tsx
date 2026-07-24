"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { useGuestStore } from "@/features/guest-mode/stores/guest-mode/hooks";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useAuthState } from "@/store/auth";
import { EAUTH_SOURCE } from "@/utils/commons/enums";

import type { TOAuthProviderV2Props } from "./types";

export default function OAuthProviderV2(props: TOAuthProviderV2Props) {
  const { provider, imageURL, onClick } = props;
  const { sendTrackingEvent } = useSendTrackingEvent();
  const signInWithProvider = useAuthState((state) => state.signInWithProvider);
  const guestSignInSource = useAuthState((state) => state.guestSignInSource);
  const guestStore = useGuestStore();

  const t = useTranslations("loginPage.loginForm");

  const label = t("cta", {
    platform: provider.charAt(0).toUpperCase() + provider.slice(1),
  });

  const handleLogin = async () => {
    if (onClick) {
      onClick(provider);
      return;
    }

    // Flow for guest mode
    if (guestStore && guestSignInSource) {
      sendTrackingEvent({
        name: EventKeys.GuestSignInStart,
        payload: {
          guest_id: guestStore.getState().anonId || "",
          signin_source: EAUTH_SOURCE.DEFAULT,
          vulcan_state: guestSignInSource,
        },
      });
      await signInWithProvider(provider);
      return;
    }

    sendTrackingEvent({
      name: EventKeys.SignInStart,
      payload: {
        signin_method: provider,
        signin_source: EAUTH_SOURCE.DEFAULT,
      },
    });
    await signInWithProvider(provider);
  };

  return (
    <button
      type="button"
      data-testid={provider}
      className="rounded-default dark:bg-surface-action-inverse-default py-medium-1.5 text-bodyS-highlight dark:text-text-action-inverse-default border-border-input-default inline-flex items-center justify-center border shadow-md transition duration-300 ease-out hover:bg-[#FFFFFF] dark:border-none dark:shadow-none"
      onClick={handleLogin}
    >
      <span className="gap-x-medium-2 inline-flex items-center justify-center">
        <Image src={imageURL} width={20} height={20} alt={provider} />
        {label}
      </span>
    </button>
  );
}
