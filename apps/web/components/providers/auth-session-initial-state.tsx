import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
} from "@cs/api-client/server/cookies";
import { cookies } from "next/headers";
import type { ReactNode } from "react";

import { AuthSyncProvider } from "@/components/providers/auth-sync-provider";

/**
 * Reads only cookie *presence* (never `.get().value` — both are httpOnly
 * anyway, unreadable here for any other reason) so `ApiAuthProvider` can skip
 * its mount-time `restoreSessionOnce()` call entirely when neither cookie
 * exists at all — a visitor who was never logged in has nothing to restore,
 * so there's no reason to wait on `isInitializing` before rendering as
 * logged-out. When either cookie is present, behavior is unchanged: the
 * client still runs the real restore to resolve the actual session.
 *
 * A Server Component reading `cookies()` must sit behind its own `<Suspense>`
 * boundary under `cacheComponents` (see `app/layout.tsx`), or the build fails
 * static-shell validation.
 */
export const AuthSessionInitialState = async ({
  children,
}: {
  children: ReactNode;
}) => {
  const store = await cookies();
  const initialState = {
    hasAccessTokenCookie: store.has(ACCESS_TOKEN_COOKIE),
    hasRefreshTokenCookie: store.has(REFRESH_TOKEN_COOKIE),
  };

  return (
    <AuthSyncProvider initialState={initialState}>{children}</AuthSyncProvider>
  );
};
