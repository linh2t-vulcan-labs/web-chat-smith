"use client";

import { useApiAuth } from "@cs/api-client/providers/auth-provider";
import { Skeleton } from "@cs/ui/components/skeleton";

import { useGuestSession } from "@/components/providers/guest-session-provider";

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

  if (isAuthInitializing || (!isAuthenticated && isGuestInitializing)) {
    return <Skeleton className="h-6 w-48" />;
  }

  if (isAuthenticated) {
    return null;
  }

  const guestStatusLabel = () => {
    if (isGuest && guestAccessToken) {
      return " — session active";
    }
    if (captchaFailed) {
      return " — verification failed, reload to try again";
    }
    // The invisible Turnstile challenge (see GuestSessionProvider) is
    // resolving in the background — no visible widget, just this hint.
    return needsCaptcha ? " — verifying…" : " — provisioning session…";
  };

  return (
    <p className="text-muted-foreground text-sm">
      Browsing as guest
      {guestStatusLabel()}
    </p>
  );
};
