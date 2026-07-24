import { routing } from "@/i18n/routing";
import { CALLBACK_URL_QUERY_PARAM } from "@/utils/constants/common";
import { LOGIN_PAGE_URL, MY_PLAN_URL } from "@/utils/constants/url";

export type PricingCtaVariant = "guest" | "upgrade" | "viewMyPlan";

/**
 * CTA URLs for the pricing plans panel.
 *
 * - `*LinkHref`: pathname only — pass to next-intl `Link` with `locale` (router adds `/zh` when needed).
 * - `*NavigateHref`: full path with locale segment (`/en/...`, `/zh/...`) — use with `assignPricingLocationHref`
 *   when leaving the landing layout so App Router `[locale]` resolves correctly.
 */
export interface PricingCtaPaths {
  loginLinkHref: string;
  manageLinkHref: string;
  loginNavigateHref: string;
  manageNavigateHref: string;
}

export function getPricingCtaPaths(locale: string): PricingCtaPaths {
  const resolvedLocale = routing.locales.includes(
    locale as (typeof routing.locales)[number]
  )
    ? (locale as (typeof routing.locales)[number])
    : routing.defaultLocale;

  const localePrefix = `/${resolvedLocale}`;
  const manageNavigateHref = `${localePrefix}${MY_PLAN_URL}`;

  const loginQuery = new URLSearchParams({
    [CALLBACK_URL_QUERY_PARAM]: manageNavigateHref,
  });

  return {
    loginLinkHref: LOGIN_PAGE_URL,
    loginNavigateHref: `${localePrefix}${LOGIN_PAGE_URL}?${loginQuery.toString()}`,
    manageLinkHref: MY_PLAN_URL,
    manageNavigateHref,
  };
}

export function resolvePricingCtaVariant(
  isLoggedIn: boolean,
  isPremium: boolean
): PricingCtaVariant {
  if (!isLoggedIn) {
    return "guest";
  }
  if (isPremium) {
    return "viewMyPlan";
  }
  return "upgrade";
}

/** Full-page navigation from landing → main app (runs middleware). */
export function assignPricingLocationHref(pathWithQuery: string): void {
  if (globalThis.window === undefined) {
    return;
  }

  const url = new URL(pathWithQuery, globalThis.window.location.origin);
  globalThis.window.location.assign(url.toString());
}
