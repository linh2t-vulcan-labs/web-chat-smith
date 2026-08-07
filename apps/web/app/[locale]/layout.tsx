import { PublicEnvScript } from "@cs/env/bridge";
import { routing } from "@cs/i18n/routing";
import { getLocaleConfig } from "@cs/i18n/utils";
import { ThemeScript } from "@cs/themes";
import { Toaster } from "@cs/ui/components/shadcn/toast";
import { cn } from "@cs/ui/lib/utils";

import "@cs/ui/globals.css";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Geist_Mono, Inter } from "next/font/google";
import { Suspense } from "react";
import type { ReactNode } from "react";

import { OfflineBanner } from "@/components/layout/offline-banner";
import { RootProviders } from "@/components/layout/root-providers";

export const generateStaticParams = () =>
  routing.locales.map((locale) => ({ locale }));

/** Every page's own `metadata.title` (a literal string, e.g. "Chat") fills `%s` here — see each `page.tsx` under `app/[locale]/**`. */
export const metadata: Metadata = {
  title: {
    default: "Chat Smith",
    template: "%s | Chat Smith",
  },
};

/**
 * `locale` is a Next.js root param
 * (https://nextjs.org/docs/app/api-reference/functions/next-root-params), so
 * this file must be the app's only root layout — no `layout.tsx` above it —
 * for `getLocale()`/`next/root-params` to resolve `locale` here at all. It
 * renders `<html>`/`<body>` for BOTH `(workspace)` and `(marketing)` (see
 * those groups' own nested layouts), instead of each owning its own root
 * layout, specifically so navigating between them (the shared `Header`'s nav
 * links cross between the two) stays a client-side transition — Next.js
 * gives every additional root layout a hard full-page-load boundary
 * (https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layout).
 *
 * `getLocale()` resolves via `@cs/i18n/request`'s `createRequestConfig`,
 * which reads `next/root-params` and 404s an invalid locale segment — see
 * that file. Because this layout awaits that resolution directly (to render
 * a correct `lang`/`dir` from the first SSR byte), it can't defer behind a
 * `<Suspense>` boundary, so `instant` stays `false` for the whole app, same
 * as before centralizing this validation.
 * https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/instant#disabling-static-shell-validation
 */
export const instant = false;

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

const LocaleRootLayout = async ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const locale = await getLocale();
  const { direction } = getLocaleConfig(locale);

  return (
    <html
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
      dir={direction}
      lang={locale}
      suppressHydrationWarning
    >
      <head>
        {/* Lets the browser theme native form controls/scrollbars from the
            OS preference immediately at parse time, before ThemeScript (which
            knows the actual stored preference) runs. */}
        <meta content="light dark" name="color-scheme" />
        <ThemeScript />
        {/* Must render before any client component reads env during hydration
          (ApiAuthProvider's effect resolves the api-client base URL via
          `getRuntimeEnv()` — see @cs/env/bridge and docs/runbook/api-client.md).
          Suspense-isolated so `await io()` inside PublicEnvScript can exclude
          it from the Cache Components static shell — see @cs/env/bridge. */}
        <Suspense fallback={null}>
          <PublicEnvScript />
        </Suspense>
      </head>
      <body>
        <RootProviders>
          <NextIntlClientProvider>
            {/* Self-closing: `toast.add()` is a module-level singleton manager
                (`ToastPrimitive.createToastManager()`), so any component in the
                tree can call it — this just renders the one portal/viewport that
                displays whatever's added. */}
            <Toaster />
            <OfflineBanner />
            {children}
          </NextIntlClientProvider>
        </RootProviders>
      </body>
    </html>
  );
};

export default LocaleRootLayout;
