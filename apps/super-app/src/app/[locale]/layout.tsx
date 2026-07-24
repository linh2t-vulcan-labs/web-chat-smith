import "../globals.css";
import { env } from "@cs/env";
import { PublicEnvScript } from "@cs/env/bridge";
import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";

import { AppProviders } from "@/components/providers";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/toaster";
import { routing } from "@/i18n/routing";
import CoralogixProvider from "@/libs/coralogix";
import { WebTrackingProvider } from "@/libs/tracking/provider";
import { generateDefaultMetadata } from "@/metadata/seo";
import { compositeStyles } from "@/utils/commons/styles";

export { viewport } from "@/metadata/seo";
// Pinning to the weights actually used (font-light/normal/medium/semibold/bold
// across the app) instead of the full 100-900 variable range shrinks every
// unicode-range subset next/font generates — the largest one alone was 83.8KiB.
const inter = Inter({
  display: "swap",
  fallback: ["Verdana", "Tahoma", "Trebuchet MS"],
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

interface TLocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: TLocaleLayoutProps): Promise<Metadata> {
  const { locale } = await params;
  return await generateDefaultMetadata(locale);
}

export default async function LocaleLayout({
  children,
  params,
}: TLocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  // const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      dir={locale === "ar" ? "rtl" : "ltr"}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Must render before any client component reads window.__CS_ENV__
          during hydration — keep this first, as a blocking <script>. */}
        <PublicEnvScript />
        {/* GTM injects Facebook Pixel + Clarity as tags on every page; Firebase
          Auth/GIS are now lazy so preconnecting to google origins is unused. */}
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://www.clarity.ms" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body
        className={compositeStyles(
          inter.className,
          "bg-v1-surface-hierarchy-base text-text-general-primary"
        )}
      >
        <WebTrackingProvider
          gtmConfig={{
            gtmAuth: env.GTM_AUTH ?? "",
            gtmId: env.GTM_ID ?? "",
            gtmPreview: env.GTM_PREVIEW ?? "",
          }}
        >
          <ThemeProvider>
            <NextIntlClientProvider
            // locale={locale}
            // messages={messages}
            >
              <AppProviders>{children}</AppProviders>
              <Toaster expand position="top-right" />
            </NextIntlClientProvider>
          </ThemeProvider>
        </WebTrackingProvider>
      </body>
      {/* <ReactScan /> */}
      <CoralogixProvider />
    </html>
  );
}
