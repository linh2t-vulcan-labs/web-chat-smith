import { cookies } from "next/headers";
import type { PropsWithChildren } from "react";
import React from "react";

import { GuestLayout } from "@/components/guest-layout";
import { GuestProvider } from "@/features/guest-mode/stores/guest-mode/context";
import { GoogleSigninOneTap } from "@/hooks/auth/google-signin-one-tap";
import { COOKIE_NAME } from "@/utils/commons/keys";

export default async function Layout({ children }: PropsWithChildren) {
  let guestToken: string | undefined;
  let authToken: string | undefined;

  try {
    const cookieStore = await cookies();
    guestToken = cookieStore.get(COOKIE_NAME.VULCAN_GUEST_TOKEN)?.value;
    authToken = cookieStore.get(COOKIE_NAME.VULCAN_AUTH_TOKEN)?.value;
  } catch (error) {
    console.error("[GuestLayout] Failed to access cookies:", error);
    // If cookie access fails, treat as no token (show captcha)
    guestToken = undefined;
    authToken = undefined;
  }

  if (authToken) {
    return null;
  }

  return (
    <>
      <GuestProvider options={{ isShowCaptchaModal: !guestToken }}>
        <GuestLayout>{children}</GuestLayout>
      </GuestProvider>
      <GoogleSigninOneTap />
    </>
  );
}
