import { env } from "@cs/env";
import { unstable_cache } from "next/cache";

import { normalizeAppLocale } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
import { safeSanityFetchWithFallback } from "@/libs/sanity";

import type { PolicySlug } from "../types";
import { POLICY_PAGE_LOCALES_QUERY } from "./queries";

function normalizePublishedLocales(
  locales: (string | null | undefined)[]
): string[] {
  const supported = new Set<string>(routing.locales);
  const unique = new Set<string>();

  for (const locale of locales) {
    if (!locale) {
      continue;
    }
    const normalized = normalizeAppLocale(locale);
    if (supported.has(normalized)) {
      unique.add(normalized);
    }
  }

  return [...unique];
}

export const getPolicyPageLocales = unstable_cache(
  async (slug: PolicySlug): Promise<string[]> => {
    const locales = await safeSanityFetchWithFallback<(string | null)[]>(
      POLICY_PAGE_LOCALES_QUERY,
      [],
      { slug },
      {
        next: {
          revalidate: env.SANITY_REVALIDATE_TIME,
          tags: ["policy-page-locales", `policy-page:${slug}`],
        },
      }
    );

    const normalized = normalizePublishedLocales(locales);
    return normalized.length > 0 ? normalized : [...routing.locales];
  },
  ["policy-page-locales"],
  {
    revalidate: env.SANITY_REVALIDATE_TIME,
    tags: ["policy-page-locales"],
  }
);
