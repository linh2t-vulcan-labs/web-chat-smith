"use client";

import { ApiAuthProvider } from "@cs/api-client/providers/auth-provider";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import type { ReactNode } from "react";

/**
 * Wraps `ApiAuthProvider` so server-rendered Server Components
 * stay in sync with the browser session — on a sign-in/sign-out transition
 * in THIS tab (button click) or a DIFFERENT tab (`TokenManager`'s
 * BroadcastChannel), `onAccessTokenChange` fires here and we `router.refresh()`
 * to re-run every Server Component on the page against the new cookies.
 *
 * Only a genuine authenticated<->unauthenticated transition triggers a
 * refresh — a same-session token rotation (proactive/reactive refresh)
 * changes the token value but not what a Server Component would render, so
 * refreshing for that would just be wasted work. The very first callback
 * (the mount-time session restore) is also skipped: the server already
 * rendered this request with the same cookies, so there's nothing new for a
 * refresh to pick up.
 *
 * Deliberately `useRouter` from `next/navigation`, NOT `@cs/i18n/navigation`
 * — the only method used here is `.refresh()`, which next-intl's
 * `createNavigation` wrapper passes through unmodified anyway (it only
 * overrides `push`/`replace`/`prefetch` for locale-aware paths), so wrapping
 * it would add nothing. It does, however, internally call `useLocale()`,
 * which requires `NextIntlClientProvider` context — using the plain router
 * keeps this provider free of that dependency, which is what lets it (and
 * `ApiAuthProvider`) mount in the LOCALE-INDEPENDENT root `app/layout.tsx`
 * instead of inside `[locale]/layout.tsx`. That distinction matters because
 * anything inside `[locale]/layout.tsx` fully remounts on the client on
 * every locale switch (see that file's own comment on why `ThemeProvider`
 * lives in the root layout for the same reason) — mounting the auth session
 * provider there was resetting `isInitializing` to `true` (briefly
 * re-showing a loading skeleton) on every language change, even though the
 * underlying `TokenManager` singleton never actually re-fetched anything.
 */
export const AuthSyncProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const isFirstChange = useRef(true);
  const wasAuthenticated = useRef(false);

  const handleAccessTokenChange = (accessToken: string | null) => {
    const isAuthenticated = accessToken !== null;
    if (isFirstChange.current) {
      isFirstChange.current = false;
      wasAuthenticated.current = isAuthenticated;
      return;
    }
    if (isAuthenticated !== wasAuthenticated.current) {
      wasAuthenticated.current = isAuthenticated;
      router.refresh();
    }
  };

  return (
    <ApiAuthProvider onAccessTokenChange={handleAccessTokenChange}>
      {children}
    </ApiAuthProvider>
  );
};
