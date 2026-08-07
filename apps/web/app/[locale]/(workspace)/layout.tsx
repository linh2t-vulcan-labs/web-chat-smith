import type { ReactNode } from "react";
import { Suspense } from "react";

import { Header } from "@/components/layout/header";
import { ThemeToggleGated } from "@/components/layout/theme-toggle-gated";
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
 * `FlagsProvider`/`NotificationsProvider`/`GuestSessionProvider` don't mount
 * outside `[locale]` anymore — with `locale` as a root param, there's no
 * layer left above `[locale]` that isn't shared with `(marketing)` (see
 * `app/[locale]/layout.tsx`'s comment on why both groups now share ONE root
 * layout). All three remount on a locale switch as a result; see each
 * provider's own comment for what that costs and why it's an accepted
 * trade-off rather than a bug — `GuestSessionProvider` in particular seeds
 * its state from the already-live `getGuestTokenManager()` singleton instead
 * of a cold-start default, so a remount doesn't visibly redo provisioning.
 *
 * These three are also why marketing pages (`app/[locale]/(marketing)/...`)
 * don't mount this layout at all — they don't need Remote Config, FCM, or a
 * guest session, so they don't pay for any of this JS/work.
 */
const WorkspaceLayout = ({ children }: { children: ReactNode }) => (
  <FlagsProvider>
    {/* `ThemeToggleGated` reads `useFlag`, so `Header` must render inside
        `<FlagsProvider>`, not before it. */}
    <Header themeToggle={<ThemeToggleGated />} />
    <main>
      <NotificationsProvider>
        <Suspense
          fallback={<GuestSessionProvider>{children}</GuestSessionProvider>}
        >
          <GuestSessionInitialState>{children}</GuestSessionInitialState>
        </Suspense>
      </NotificationsProvider>
    </main>
  </FlagsProvider>
);

export default WorkspaceLayout;
