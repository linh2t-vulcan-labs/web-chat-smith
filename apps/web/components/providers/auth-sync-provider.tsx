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
 * keeps this provider free of that dependency.
 *
 * `locale` is a root param (see `app/[locale]/layout.tsx`), so this
 * provider — mounted via `components/layout/root-providers.tsx` — fully
 * remounts on the client on every locale switch (there's no layer left
 * above `[locale]` to hide it behind). `ApiAuthProvider` seeds its own
 * `isInitializing` from `TokenManager.hasRestored()` on mount (see that
 * provider's doc comment), so this remount does NOT re-show a loading
 * skeleton once the tab has already restored once — the underlying
 * `TokenManager` singleton never re-fetches anything either way.
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
