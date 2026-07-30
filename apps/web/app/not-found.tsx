import { COOKIE_NAME_LOCALE, DEFAULT_LOCALE } from "@cs/i18n/constants";
import { getPathname } from "@cs/i18n/navigation";
import { isValidLocale } from "@cs/i18n/utils";
import type { Route } from "next";
import { getExtracted } from "next-intl/server";
import { cookies } from "next/headers";
import Link from "next/link";

// Root layout (`app/layout.tsx`) renders `<html>` but deliberately has no
// `<body>` of its own — `<body>` is only ever rendered by
// `LocaleLayoutShell` (`components/layout/locale-layout-shell.tsx`), so the
// `dir` attribute is correct from the first byte for RTL locales. That same
// shell is what calls `notFound()` for an invalid locale segment, and it
// throws before ever rendering `<body>`. This file is what Next falls back
// to for both that case and any genuinely unmatched route — either way,
// `<body>` never came from anywhere else, so it must be supplied here (but
// not `<html>`, which the root layout already rendered — adding one here
// would nest it).
//
// There's no `[locale]` route param here (Next doesn't pass one to
// `not-found.tsx`), but the visitor's last-selected locale is still readable
// from the routing cookie — same one `routing.localeCookie` sets — so this
// calls `getExtracted({ locale })` with an explicit locale (the same pattern
// `playground/page.tsx` uses) instead of relying on `NextIntlClientProvider`
// context, which was never established on this path. Falls back to the
// default locale if the cookie is missing/stale. Reuses the same
// `Common.notFound.*` keys as the locale-scoped `not-found.tsx` files so
// there's one translation, not two.
//
// `instant = false`: this route always reads `cookies()` before it can
// decide what to render — the whole page IS the fallback content, so there's
// nothing to defer behind a `<Suspense>` boundary. Same "Block" call as the
// `[locale]` layouts' own `instant = false` for their locale-validation gate.
export const instant = false;

export default async function NotFound() {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(COOKIE_NAME_LOCALE)?.value;
  const locale = isValidLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const t = await getExtracted({ locale });
  const homeHref = getPathname({ href: "/", locale });

  return (
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
        {/* `next/link`'s plain `Link` (not `@cs/i18n/navigation`'s) — that
            one needs `useLocale()`/intl context even with an explicit
            `locale` prop, which this path never establishes (throws "No
            intl context found"). Plain `next/link` has no i18n dependency,
            so it works here and gives real client-side navigation instead
            of a full reload. `homeHref` is cast because Next's typed-routes
            checking only recognizes `[locale]`-nested pages — "/" itself
            isn't a registered route even though it resolves correctly at
            runtime. */}
        <Link href={homeHref as Route}>
          {t({ id: "Common.notFound.homeLink", message: "Return home" })}
        </Link>
      </div>
    </body>
  );
}
