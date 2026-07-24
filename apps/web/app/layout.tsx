import { PublicEnvScript } from "@cs/env/bridge";
import { ThemeProvider, ThemeScript } from "@cs/themes";
import { cn } from "@cs/ui/lib/utils";

import "@cs/ui/globals.css";
import { Geist_Mono, Inter } from "next/font/google";

// Locale-independent shell: fonts, the anti-FOUC theme script, the
// @cs/env public-config bridge script, and the single <html>/<body> the App
// Router requires. Kept outside `[locale]` on purpose — a layout owning a
// dynamic segment's own param gets fully remounted on the client whenever
// that param changes (e.g. switching locale), which would recreate these
// scripts client-side and hit React's dev-only "script tag" warning for no
// benefit (their only job is a one-time cold-load setup that already
// happened by then; the recreated client-side node also never actually
// executes, since a browser only runs a <script> tag it parses from HTML,
// not one a client re-render inserts — so PublicEnvScript would silently
// stop refreshing `window.__CS_ENV__` on every locale switch if placed in
// `[locale]/layout.tsx` instead).
// Verified this is actually about the remount, not the script mechanism:
// swapping to `next/script` with strategy="beforeInteractive" while leaving
// <html> inside `[locale]/layout.tsx` still hit the same warning.
// `lang`/`dir` are set from a static default here and corrected reactively
// once the client knows the real locale (see `HtmlLangSync`) rather than
// read from a request-scoped source, keeping that part of this layout
// locale-independent.
//
// This layout has no dynamic API reads (no `headers()`/`cookies()`), so it
// can fully prerender under `cacheComponents` — no Suspense boundary needed
// here. (An earlier version read a per-request CSP nonce via `headers()`
// behind a Suspense boundary; that's gone — see packages/security/README.md
// for why nonce-based CSP was dropped.)
//
// This doesn't make the *app* fully static, though: the nested
// `[locale]/layout.tsx` reads `params` to validate the locale and gate
// `notFound()` before rendering anything, which can't move behind a
// <Suspense> boundary either — so no real route in this app produces an
// instant/static shell as long as i18n routing works this way. The
// static-shell check only respects this setting on the root layout (this
// file), not on `[locale]`.
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config/instant#disabling-static-shell-validation
// export const instant = false;
// export const prefetch = "allow-runtime";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html
    lang="en"
    suppressHydrationWarning
    className={cn(
      "antialiased",
      fontMono.variable,
      "font-sans",
      inter.variable
    )}
  >
    <head>
      {/* Lets the browser theme native form controls/scrollbars from the
          OS preference immediately at parse time, before ThemeScript (which
          knows the actual stored preference) runs. */}
      <meta content="light dark" name="color-scheme" />
      <ThemeScript />
      {/* Must render before any client component reads env during hydration
        (ApiAuthProvider's effect resolves the api-client base URL via
        `getRuntimeEnv()` — see @cs/env/bridge and docs/runbook/api-client.md). */}
      <PublicEnvScript />
    </head>
    {/* Locale-independent: theme has no i18n dependency, so it lives here
        rather than in `[locale]/layout.tsx` — state survives a locale
        switch instead of resetting on every remount. */}
    <ThemeProvider>{children}</ThemeProvider>
  </html>
);

export default RootLayout;
