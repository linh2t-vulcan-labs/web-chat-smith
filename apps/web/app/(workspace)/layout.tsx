import type { ReactNode } from "react";
import { Suspense } from "react";

import { FlagsProvider } from "@/components/providers/flags-provider";
import { GuestSessionInitialState } from "@/components/providers/guest-session-initial-state";
import { GuestSessionProvider } from "@/components/providers/guest-session-provider";
import { NotificationsProvider } from "@/components/providers/notifications-provider";

/**
 * Shared shell for routes that work for BOTH guests and authenticated users
 * at the same URL (`/chat`, `/design-studio`) — no separate `/guest/*` route
 * tree the way apps/super-app has one. Guest-vs-authenticated is a session
 * concern handled here and in `GuestSessionProvider`, not a routing concern:
 * `apps/web/proxy.ts` deliberately does no redirect gating for these routes.
 *
 * Sits ABOVE `(workspace)/[locale]/layout.tsx` on purpose, mirroring why
 * `AuthSyncProvider` lives in the true root `app/layout.tsx` instead of
 * inside a `[locale]`-scoped layout: a layout owning a dynamic segment's own
 * param fully remounts on the client whenever that param changes (e.g.
 * switching locale). `FlagsProvider`/`NotificationsProvider`/
 * `GuestSessionProvider` all have a real, non-idempotent mount cost, not
 * just a UI flicker, if remounted on every language switch:
 *   - `FlagsProvider`: `flagsEngine().init()` has no idempotency guard — a
 *     remount is a real repeat Firebase Remote Config fetch.
 *   - `NotificationsProvider`: re-runs its FCM-token-sync effect (a real
 *     `getToken()` call) and tears down/re-subscribes the foreground-message
 *     listener on every mount.
 *   - `GuestSessionProvider`: resets `needsCaptcha`/`isInitializing` to their
 *     cold-start values, which used to visibly re-show "provisioning
 *     session…" on every language change even though the underlying
 *     `getGuestTokenManager()` singleton never actually lost its session.
 *
 * These three are also why marketing pages (`app/(marketing)/...`) don't
 * mount this layout at all — they don't need Remote Config, FCM, or a guest
 * session, so they don't pay for any of this JS/work.
 */
const WorkspaceLayout = ({ children }: { children: ReactNode }) => (
  <FlagsProvider>
    <NotificationsProvider>
      <Suspense
        fallback={<GuestSessionProvider>{children}</GuestSessionProvider>}
      >
        <GuestSessionInitialState>{children}</GuestSessionInitialState>
      </Suspense>
    </NotificationsProvider>
  </FlagsProvider>
);

export default WorkspaceLayout;
