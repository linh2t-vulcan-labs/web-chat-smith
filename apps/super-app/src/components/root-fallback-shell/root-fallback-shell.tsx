import { ThemeProvider } from "@/components/providers/theme-provider";
import { compositeStyles } from "@/utils/commons/styles";

/**
 * Locale-less document shell shared by the root `not-found.tsx`, `error.tsx`,
 * and `global-error.tsx` files. These render outside `[locale]/layout.tsx`
 * (the only place `lang`/`dir` is set up), so `lang` stays static English —
 * only the dark/light theme is restored here, since it doesn't depend on locale.
 *
 * `error.tsx`/`global-error.tsx` are Client Components (a Next.js requirement),
 * which pulls this shell into the client bundle too — `next/font/google` calls
 * aren't valid there, so this relies on the `font-sans` CSS variable (globals.css)
 * instead of self-hosting Inter again.
 */
export default function RootFallbackShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={compositeStyles("font-sans", "bg-surface-general-primary")}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
