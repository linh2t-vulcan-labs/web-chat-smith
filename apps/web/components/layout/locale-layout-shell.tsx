import { getLocaleConfig, isValidLocale } from "@cs/i18n/utils";
import { HtmlLangSync } from "@cs/ui/components/cs/html-lang-sync";
import { Toaster } from "@cs/ui/components/shadcn/toast";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { Header } from "@/components/layout/header";
import { OfflineBanner } from "@/components/layout/offline-banner";

export interface LocaleLayoutShellProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

/**
 * Shared body for both `(marketing)/[locale]/layout.tsx` and
 * `(workspace)/[locale]/layout.tsx` — identical locale validation,
 * `<body>`/`NextIntlClientProvider`/`HtmlLangSync`/`Header` shape either way,
 * so it lives once here instead of twice. `generateStaticParams` (and any
 * route-segment config) still has to be exported directly from each
 * `layout.tsx` file itself — Next.js doesn't pick those up from an imported
 * component — which is why each branch keeps its own thin wrapper file.
 */
export const LocaleLayoutShell = async ({
  children,
  params,
}: LocaleLayoutShellProps) => {
  const { locale } = await params;
  if (!isValidLocale(locale)) {
    notFound();
  }

  // Enable static rendering for this request's locale.
  setRequestLocale(locale);

  const { direction } = getLocaleConfig(locale);

  return (
    // `dir` is read here (not the static outer layout) so it's correct from
    // the first SSR byte for every locale, including RTL ones — no flash.
    <body dir={direction}>
      <NextIntlClientProvider>
        <HtmlLangSync locale={locale} />
        {/* Self-closing: `toast.add()` is a module-level singleton manager
            (`ToastPrimitive.createToastManager()`), so any component in the
            tree can call it — this just renders the one portal/viewport that
            displays whatever's added, matching the QA gallery's usage
            (`components/shadcn/layout-feedback.tsx`). Previously nothing
            mounted this outside that gallery, so `toast.add()` calls
            elsewhere in the app (e.g. `chatbot.tsx`) silently rendered
            nothing. */}
        <Toaster />
        <OfflineBanner />
        <Header />
        <main>{children}</main>
      </NextIntlClientProvider>
    </body>
  );
};
