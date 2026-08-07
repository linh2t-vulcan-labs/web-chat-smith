import { ThemeToggle } from "@cs/themes";
import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";

/**
 * No `FlagsProvider`/`NotificationsProvider`/`GuestSessionProvider` here on
 * purpose — those are workspace-only concerns (see
 * `app/[locale]/(workspace)/layout.tsx`), so marketing pages don't pay for
 * Firebase Remote Config / FCM / guest-session JS they never use. That also
 * means `ENABLE_THEME_TOGGLE` can't be read here (no `<FlagsProvider>` to
 * back `useFlag`) — `ThemeToggle` renders unconditionally, matching the
 * flag's own default (`true`) and its "always-on/long-lived config" intent
 * (see `apps/web/lib/flags.ts`'s schema comment).
 */
const MarketingLayout = ({ children }: { children: ReactNode }) => (
  <>
    <Header themeToggle={<ThemeToggle />} />
    <main>{children}</main>
  </>
);

export default MarketingLayout;
