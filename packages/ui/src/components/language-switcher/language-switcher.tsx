"use client";

import { SUPPORTED_LOCALES } from "@cs/i18n/constants";
import { useLocale, usePathname, useRouter } from "@cs/i18n/navigation";
// `useExtracted` can't be wrapped: next-intl's extraction compiler statically
// matches this exact import, and re-exporting the hook is an explicitly
// unsupported pattern (https://next-intl.dev/docs/usage/extraction).
import { useExtracted } from "next-intl";
import type { ChangeEvent } from "react";

import { useBroadcastChannel } from "#hooks/use-broadcast-channel";
import { cn } from "#lib/utils";

export interface LanguageSwitcherProps {
  className?: string;
}

/** Cross-tab: switching locale in one tab broadcasts it here so every other tab navigates to the same locale, on its own current path. */
const LOCALE_SYNC_CHANNEL = "cs-locale-sync";

export const LanguageSwitcher = ({ className }: LanguageSwitcherProps) => {
  // Inline messages from this package are extracted into whichever app
  // configures `srcPath` to include `@cs/ui/src` (see @cs/i18n/config).
  const t = useExtracted("LanguageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  // Only read inside `onChange`; next-intl's locale-stripping logic isn't
  // reproducible via `window.location` without duplicating it here.
  // oxlint-disable-next-line react-doctor/rerender-defer-reads-hook
  const pathname = usePathname();

  const publishLocaleChange = useBroadcastChannel<string>(
    LOCALE_SYNC_CHANNEL,
    (nextLocale) => {
      if (nextLocale !== locale) {
        router.replace(pathname, { locale: nextLocale });
      }
    }
  );

  const onChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value;
    router.replace(pathname, { locale: nextLocale });
    publishLocaleChange(nextLocale);
  };

  return (
    <label className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <span className="sr-only">{t("Language")}</span>
      <select
        className="h-8 rounded-lg border border-border bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        onChange={onChange}
        value={locale}
      >
        {SUPPORTED_LOCALES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
};
