"use client";

import { useApiAuth } from "@cs/api-client/providers/auth-provider";
import { Skeleton } from "@cs/ui/components/shadcn/skeleton";

import { useGuestSession } from "@/components/providers/guest-session-provider";

type GuestStatus = "active" | "captcha-failed" | "provisioning" | "verifying";

const GUEST_STATUS_LABEL: Record<GuestStatus, string> = {
  active: " — session active",
  "captcha-failed": " — verification failed, reload to try again",
  provisioning: " — provisioning session…",
  // The invisible Turnstile challenge (see GuestSessionProvider) is
  // resolving in the background — no visible widget, just this hint.
  verifying: " — verifying…",
};

const resolveGuestStatus = ({
  isGuest,
  guestAccessToken,
  captchaFailed,
  needsCaptcha,
}: {
  isGuest: boolean;
  guestAccessToken: string | null;
  captchaFailed: boolean;
  needsCaptcha: boolean;
}): GuestStatus => {
  if (isGuest && guestAccessToken) {
    return "active";
  }
  if (captchaFailed) {
    return "captcha-failed";
  }
  return needsCaptcha ? "verifying" : "provisioning";
};

/**
 * Proves the guest-session infra end-to-end on a real page: shows the guest
 * session's status while signed out (provisioned transparently by
 * `GuestSessionProvider`). Renders nothing once authenticated — sign-in/out
 * and profile now live once in the shared `<Header>`
 * (`apps/web/components/layout/header.tsx`), not duplicated here.
 */
export const WorkspaceSessionStatus = () => {
  const { isAuthenticated, isInitializing: isAuthInitializing } = useApiAuth();
  const {
    isGuest,
    guestAccessToken,
    isInitializing: isGuestInitializing,
    needsCaptcha,
    captchaFailed,
  } = useGuestSession();

  const isLoading =
    isAuthInitializing || (!isAuthenticated && isGuestInitializing);
  if (isLoading) {
    return <Skeleton className="h-6 w-48" />;
  }

  if (isAuthenticated) {
    return null;
  }

  const guestStatus = resolveGuestStatus({
    captchaFailed,
    guestAccessToken,
    isGuest,
    needsCaptcha,
  });

  return (
    <p className="text-muted-foreground text-sm">
      Browsing as guest
      {GUEST_STATUS_LABEL[guestStatus]}
    </p>
  );
};
