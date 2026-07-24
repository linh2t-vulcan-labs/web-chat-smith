import { ApiAuthProvider } from "@cs/api-client/providers/auth-provider";
import { ApiQueryProvider } from "@cs/api-client/providers/query-client-provider";
import { routing } from "@cs/i18n/routing";
import { getLocaleConfig, isValidLocale } from "@cs/i18n/utils";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { HtmlLangSync } from "@/components/html-lang-sync";
import { FlagsProvider } from "@/components/providers/flags-provider";
import { NotificationsProvider } from "@/components/providers/notifications-provider";

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
        <ApiQueryProvider>
          <FlagsProvider>
            <ApiAuthProvider>
              <NotificationsProvider>
                <main>{children}</main>
              </NotificationsProvider>
            </ApiAuthProvider>
          </FlagsProvider>
        </ApiQueryProvider>
      </NextIntlClientProvider>
    </body>
  );
};

export default LocaleLayout;
