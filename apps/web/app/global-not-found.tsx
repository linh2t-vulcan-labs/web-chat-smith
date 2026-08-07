import { COOKIE_NAME_LOCALE, DEFAULT_LOCALE } from "@cs/i18n/constants";
import { getPathname } from "@cs/i18n/navigation";
import { isValidLocale } from "@cs/i18n/utils";

import "@cs/ui/globals.css";
import { cn } from "@cs/ui/lib/utils";
import type { Route } from "next";
import { getExtracted } from "next-intl/server";
import { Geist_Mono, Inter } from "next/font/google";
import { cookies } from "next/headers";
import Link from "next/link";

// `locale` is a Next.js root param (app/[locale]/layout.tsx is the app's
// only root layout), which makes composing a single 404 page out of
// layout.tsx + not-found.tsx impossible for two distinct cases — an invalid
// `[locale]` segment value (thrown from `@cs/i18n/request`'s `notFound()`,
// inside the root layout's OWN render, so there's no not-found.tsx above it
// in the tree to catch it) and a URL that doesn't match any route at all
// (no `[locale]` segment matched, so no locale context ever gets
// established either). `global-not-found.tsx` is Next's file convention for
// exactly this — it bypasses layout/page rendering entirely, so it must
// import its own globals/fonts and can't rely on the root layout's
// `<html>`/`<body>`, `NextIntlClientProvider`, or providers.
// https://nextjs.org/docs/app/api-reference/file-conventions/not-found#global-not-foundjs-experimental
//
// There's no locale context to read from here either way, so the visitor's
// last-selected locale comes from the routing cookie (the same one
// `routing.localeCookie` sets), falling back to the default locale.
//
// `instant = false`: this route always reads `cookies()` before it can
// decide what to render — the whole page IS the fallback content, so
// there's nothing to defer behind a `<Suspense>` boundary.
export const instant = false;

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const fontMono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default async function GlobalNotFound() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIE_NAME_LOCALE)?.value;
  const locale = isValidLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const t = await getExtracted({ locale });
  const homeHref = getPathname({ href: "/", locale });

  return (
    <html
      className={cn(fontMono.variable, "font-sans", inter.variable)}
      lang={locale}
    >
      <body>
        <div className="flex h-screen flex-col items-center justify-center gap-3 text-center">
          <h1>{t({ id: "Common.notFound.title", message: "Not found" })}</h1>
          <p>
            {t({
              id: "Common.notFound.description",
              message:
                "The page you're looking for doesn't exist or was removed.",
            })}
          </p>
          {/* Plain `next/link`, not `@cs/i18n/navigation`'s — that one needs
              `useLocale()`/intl context even with an explicit `locale` prop,
              which this path never establishes. `homeHref` is cast because
              Next's typed-routes checking only recognizes `[locale]`-nested
              pages — "/" itself isn't a registered route even though it
              resolves correctly at runtime. */}
          <Link href={homeHref as Route}>
            {t({ id: "Common.notFound.homeLink", message: "Return home" })}
          </Link>
        </div>
      </body>
    </html>
  );
}
