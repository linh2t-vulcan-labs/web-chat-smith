import { routing } from "@cs/i18n/routing";
import { ThemeToggle } from "@cs/themes";

import type { LocaleLayoutShellProps } from "@/components/layout/locale-layout-shell";
import { LocaleLayoutShell } from "@/components/layout/locale-layout-shell";

export const generateStaticParams = () =>
  routing.locales.map((locale) => ({ locale }));

/**
 * No FlagsProvider/NotificationsProvider/GuestSessionProvider here on
 * purpose — those are workspace-only concerns and live in
 * `app/(workspace)/layout.tsx` instead, so marketing pages don't pay for
 * Firebase Remote Config / FCM / guest-session JS they never use. That also
 * means `ENABLE_THEME_TOGGLE` can't be read here (no `<FlagsProvider>` to
 * back `useFlag`) — `ThemeToggle` renders unconditionally, matching the
 * flag's own default (`true`) and its "always-on/long-lived config" intent
 * (see `apps/web/lib/flags.ts`'s schema comment).
 */
export const instant = false;

const MarketingLocaleLayout = (
  props: Omit<LocaleLayoutShellProps, "themeToggle">
) => <LocaleLayoutShell {...props} themeToggle={<ThemeToggle />} />;

export default MarketingLocaleLayout;
