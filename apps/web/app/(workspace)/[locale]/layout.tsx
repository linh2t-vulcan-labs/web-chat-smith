import type { LocaleLayoutShellProps } from "@/components/layout/locale-layout-shell";
import { LocaleLayoutShell } from "@/components/layout/locale-layout-shell";

/**
 * FlagsProvider/NotificationsProvider/GuestSessionProvider mount one level
 * up, in `app/(workspace)/layout.tsx` — that layout sits ABOVE this
 * `[locale]` segment specifically so none of them remount (and re-run their
 * non-idempotent init effects) on a language switch. See that file's
 * comment for the full rationale.
 */
export const instant = false;

const WorkspaceLocaleLayout = (props: LocaleLayoutShellProps) => (
  <LocaleLayoutShell {...props} />
);

export default WorkspaceLocaleLayout;
