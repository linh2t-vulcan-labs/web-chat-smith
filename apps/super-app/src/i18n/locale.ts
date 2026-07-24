import { routing } from "./routing";

export type AppLocale = (typeof routing.locales)[number];

function resolveLocaleTag(
  input: string,
  supported: readonly string[]
): string | undefined {
  if (supported.includes(input)) {
    return input;
  }
  const hyphen = input.indexOf("-");
  if (hyphen > 0) {
    const base = input.slice(0, hyphen);
    if (supported.includes(base)) {
      return base;
    }
  }
  return undefined;
}

/** Maps an arbitrary locale string (possibly with region like "zh-CN") to a supported
 * app locale, falling back to the default when no match is found. */
export function normalizeAppLocale(
  input: string | undefined | null
): AppLocale {
  if (!input) {
    return routing.defaultLocale as AppLocale;
  }
  const resolved = resolveLocaleTag(
    String(input).trim().toLowerCase(),
    routing.locales as readonly string[]
  );
  return (resolved ?? routing.defaultLocale) as AppLocale;
}

/** Public path with locale prefix (`/zh/privacy-policy` for zh, `/privacy-policy` for en). */
export function buildLocalizedHref(locale: string, pathname: string): string {
  const normalized = normalizeAppLocale(locale);
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return normalized === routing.defaultLocale ? path : `/${normalized}${path}`;
}
