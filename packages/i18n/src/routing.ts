import { defineRouting } from "next-intl/routing";

import { COOKIE_NAME_LOCALE, DEFAULT_LOCALE, LOCALE_CODES } from "./constants";

export const routing = defineRouting({
  defaultLocale: DEFAULT_LOCALE,
  localeCookie: {
    maxAge: 60 * 60 * 24 * 365,
    name: COOKIE_NAME_LOCALE,
    sameSite: "lax" as const,
  },
  localePrefix: "as-needed",
  locales: LOCALE_CODES,
});
