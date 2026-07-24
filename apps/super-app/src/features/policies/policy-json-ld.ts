import { buildLocalizedHref } from "@/i18n/locale";
import type { AppLocale } from "@/i18n/locale";
import { APP_NAME, BASE_URL, SCHEMA_CONTEXT } from "@/metadata/seo";
import type { Graph, WithContext } from "@/metadata/seo";

const JSON_LD_LANGUAGES = {
  ar: "ar-SA",
  en: "en-US",
  es: "es-ES",
  hi: "hi-IN",
  ja: "ja-JP",
  ko: "ko-KR",
  th: "th-TH",
  zh: "zh-CN",
} as const satisfies Record<AppLocale, string>;

function isJsonLdLanguageKey(
  locale: string
): locale is keyof typeof JSON_LD_LANGUAGES {
  return locale in JSON_LD_LANGUAGES;
}

function getJsonLdInLanguage(locale: AppLocale): string {
  return isJsonLdLanguageKey(locale)
    ? JSON_LD_LANGUAGES[locale]
    : JSON_LD_LANGUAGES.en;
}

function wrapGraph(schemas: unknown[]): WithContext<Graph> {
  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": schemas,
  };
}

function createPolicyBreadcrumbList(
  homeLabel: string,
  pageLabel: string,
  pageUrl: string
) {
  return {
    "@type": "BreadcrumbList" as const,
    itemListElement: [
      {
        "@type": "ListItem" as const,
        item: BASE_URL,
        name: homeLabel,
        position: 1,
      },
      {
        "@type": "ListItem" as const,
        item: pageUrl,
        name: pageLabel,
        position: 2,
      },
    ],
  };
}

export interface PolicyPageJsonLdInput {
  locale: AppLocale;
  pathname: string;
  title: string;
  description: string;
  homeLabel: string;
  pageLabel: string;
}

/** JSON-LD graph for legal policy pages (`WebPage` + `BreadcrumbList`). */
export function createPolicyPageJsonLd(
  input: PolicyPageJsonLdInput
): WithContext<Graph> {
  const inLanguage = getJsonLdInLanguage(input.locale);
  const pageUrl = `${BASE_URL}${buildLocalizedHref(input.locale, input.pathname)}`;

  return wrapGraph([
    {
      "@type": "WebPage",
      description: input.description,
      inLanguage,
      isPartOf: {
        "@type": "WebSite",
        name: APP_NAME,
        url: BASE_URL,
      },
      name: input.title,
      publisher: {
        "@type": "Organization",
        name: APP_NAME,
        url: BASE_URL,
      },
      url: pageUrl,
    },
    createPolicyBreadcrumbList(input.homeLabel, input.pageLabel, pageUrl),
  ]);
}
