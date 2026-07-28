import { routing } from "@cs/i18n/routing";

import type { LocaleLayoutShellProps } from "@/components/layout/locale-layout-shell";
import { LocaleLayoutShell } from "@/components/layout/locale-layout-shell";

export const generateStaticParams = () =>
  routing.locales.map((locale) => ({ locale }));

/**
 * No FlagsProvider/NotificationsProvider/GuestSessionProvider here on
 * purpose — those are workspace-only concerns and live in
 * `app/(workspace)/layout.tsx` instead, so marketing pages don't pay for
 * Firebase Remote Config / FCM / guest-session JS they never use.
 */
const MarketingLocaleLayout = (props: LocaleLayoutShellProps) => (
  <LocaleLayoutShell {...props} />
);

export default MarketingLocaleLayout;
