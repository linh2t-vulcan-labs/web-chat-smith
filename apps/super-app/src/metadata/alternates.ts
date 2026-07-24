import type { Metadata } from "next";

import { routing } from "@/i18n/routing";

import { BASE_URL } from "./base-url";

function buildLocalizedPublicPath(locale: string, pathname: string): string {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const normalizedLocale = routing.locales.includes(
    locale as (typeof routing.locales)[number]
  )
    ? locale
    : routing.defaultLocale;

  return normalizedLocale === routing.defaultLocale
    ? normalizedPath
    : `/${normalizedLocale}${normalizedPath}`;
}

export interface PageAlternatesInput {
  locale: string;
  pathname: string;
  /** Locales included in hreflang; defaults to all supported routing locales. */
  hrefLangLocales?: readonly string[];
}

/** Absolute URL for a localized public path (`/home`, `/zh/pricing`, etc.). */
function buildAbsolutePublicUrl(locale: string, pathname: string): string {
  const path = buildLocalizedPublicPath(locale, pathname);
  return `${BASE_URL}${path}`;
}

/** Canonical URL and hreflang alternates for a localized public page. */
export function buildPageAlternates({
  locale,
  pathname,
  hrefLangLocales = routing.locales,
}: PageAlternatesInput): NonNullable<Metadata["alternates"]> {
  const canonical = buildAbsolutePublicUrl(locale, pathname);

  const languages: Record<string, string> = {};
  for (const loc of hrefLangLocales) {
    languages[loc] = buildAbsolutePublicUrl(loc, pathname);
  }
  languages["x-default"] = buildAbsolutePublicUrl(
    routing.defaultLocale,
    pathname
  );

  return { canonical, languages };
}

/** Merges canonical/hreflang into metadata and sets Open Graph URL when applicable. */
export function withPageAlternates(
  metadata: Metadata,
  alternates: NonNullable<Metadata["alternates"]>
): Metadata {
  const canonical =
    typeof alternates.canonical === "string" ? alternates.canonical : undefined;

  return {
    ...metadata,
    alternates,
    openGraph: canonical
      ? {
          ...metadata.openGraph,
          url: canonical,
        }
      : metadata.openGraph,
  };
}
