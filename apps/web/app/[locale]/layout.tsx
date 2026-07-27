import { routing } from "@cs/i18n/routing";
import { getLocaleConfig, isValidLocale } from "@cs/i18n/utils";
import { HtmlLangSync } from "@cs/ui/components/cs/html-lang-sync";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { Header } from "@/components/layout/header";

export const instant = false;

export const generateStaticParams = () =>
  routing.locales.map((locale) => ({ locale }));

const LocaleLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) => {
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
        {/* ApiQueryProvider/FlagsProvider/AuthSyncProvider/NotificationsProvider
            all mount in the root `app/layout.tsx` now (locale-independent —
            see that file's comment) so none of them remount on a locale
            switch. */}
        {/* Shared across BOTH the (workspace) and (marketing) route groups —
            one mount point here covers every page instead of each page
            re-assembling login/logout, language switch, and theme toggle
            itself (see `apps/web/components/layout/header.tsx`). */}
        <Header />
        <main>{children}</main>
      </NextIntlClientProvider>
    </body>
  );
};

export default LocaleLayout;
