import { GUEST_SESSION_COOKIE } from "@cs/api-client/server/guest/cookies";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { GuestSessionProvider } from "@/components/providers/guest-session-provider";

/**
 * Reads only cookie *presence* (`guest_session` is an encrypted blob anyway —
 * unusable client-side even if the value were read here) so
 * `GuestSessionProvider` can skip its mount-time restore attempt when there's
 * no guest session cookie at all and jump straight to `needsCaptcha: true`
 * instead of waiting on a `GET /api/anon/session` round-trip already known
 * to come back with no session. This is purely a latency optimization now —
 * that route reports "no session" as a clean `200`, not an error (see its
 * doc comment) — but skipping the round-trip entirely is still faster than
 * waiting for even a successful one, and this Server Component reading
 * `cookies()` is why `(workspace)` pages render dynamically (see
 * `app/(workspace)/layout.tsx`'s doc comment for that trade-off).
 *
 * A Server Component reading `cookies()` must sit behind its own `<Suspense>`
 * boundary under `cacheComponents` (see `app/(workspace)/layout.tsx`), or the
 * build fails static-shell validation.
 */
export const GuestSessionInitialState = async ({
  children,
}: {
  children: ReactNode;
}) => {
  const store = await cookies();
  const initialState = {
    hasGuestSessionCookie: store.has(GUEST_SESSION_COOKIE),
  };

  return (
    <GuestSessionProvider initialState={initialState}>
      {children}
    </GuestSessionProvider>
  );
};
