"use client";

import { SUPPORTED_LOCALES } from "@cs/i18n/constants";
import { useLocale, usePathname, useRouter } from "@cs/i18n/navigation";
// `useExtracted` can't be wrapped: next-intl's extraction compiler statically
// matches this exact import, and re-exporting the hook is an explicitly
// unsupported pattern (https://next-intl.dev/docs/usage/extraction).
import type { Locale } from "next-intl";
import { useExtracted } from "next-intl";
import { useParams } from "next/navigation";
import { useTransition } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/shadcn/select";
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
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const router = useRouter();
  // Only read inside `onChange`; next-intl's locale-stripping logic isn't
  // reproducible via `window.location` without duplicating it here.
  // oxlint-disable-next-line react-doctor/rerender-defer-reads-hook
  const pathname = usePathname();
  const params = useParams();

  const publishLocaleChange = useBroadcastChannel<string>(
    LOCALE_SYNC_CHANNEL,
    (nextLocale) => {
      if (nextLocale !== locale) {
        // @ts-expect-error -- TypeScript will validate that only known `params` are used in combination with a given `pathname`. Since the two will always match for the current route, we can skip runtime checks.
        router.replace({ pathname, params }, { locale: nextLocale });
      }
    }
  );

  const onValueChange = (nextLocale: string | null) => {
    if (!nextLocale) {
      return;
    }
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        { pathname, params },
        { locale: nextLocale as Locale }
      );
      publishLocaleChange(nextLocale);
    });
  };

  return (
    <Select disabled={isPending} onValueChange={onValueChange} value={locale}>
      <span className="sr-only">{t("Language")}</span>
      <SelectTrigger
        className={cn("text-sm", className)}
        size="sm"
        aria-label="Language"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_LOCALES.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
