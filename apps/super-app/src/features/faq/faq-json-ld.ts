import type { TQuestionAccordion, TQuestionCategory } from "@/config/faq/types";
import { buildLocalizedHref } from "@/i18n/locale";
import type { AppLocale } from "@/i18n/locale";
import { APP_NAME, BASE_URL, SCHEMA_CONTEXT } from "@/metadata/seo";
import type { Graph, WithContext } from "@/metadata/seo";
import { stripMarkdown } from "@/utils/commons/helpers";

import { buildFaqPathname } from "./paths";

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

interface FaqJsonLdQuestion {
  "@type": "Question";
  name: string;
  acceptedAnswer: {
    "@type": "Answer";
    text: string;
  };
}

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

function buildLocalizedFaqUrl(
  locale: AppLocale,
  categorySlug?: string,
  questionSlug?: string
): string {
  return `${BASE_URL}${buildLocalizedHref(locale, buildFaqPathname(categorySlug, questionSlug))}`;
}

function wrapGraph(schemas: unknown[]): WithContext<Graph> {
  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": schemas,
  };
}

function buildFaqJsonLdQuestion(
  question: TQuestionAccordion
): FaqJsonLdQuestion {
  const answerText = question.answer?.trim() || question.shortAnswer || "";

  return {
    "@type": "Question",
    acceptedAnswer: {
      "@type": "Answer",
      text: stripMarkdown(answerText),
    },
    name: question.question,
  };
}

function createFaqBreadcrumbList(items: { name: string; url?: string }[]): {
  "@type": "BreadcrumbList";
  itemListElement: {
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }[];
} {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      name: item.name,
      position: index + 1,
      ...(item.url ? { item: item.url } : {}),
    })),
  };
}

export interface FaqIndexPageJsonLdInput {
  locale: AppLocale;
  title: string;
  description: string;
  homeLabel: string;
  allFaqsLabel: string;
}

/** JSON-LD for `/faq` — `WebPage` + `BreadcrumbList`. */
export function createFaqIndexPageJsonLd(
  input: FaqIndexPageJsonLdInput
): WithContext<Graph> {
  const inLanguage = getJsonLdInLanguage(input.locale);
  const pageUrl = buildLocalizedFaqUrl(input.locale);

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
      url: pageUrl,
    },
    createFaqBreadcrumbList([
      { name: input.homeLabel, url: BASE_URL },
      { name: input.allFaqsLabel, url: pageUrl },
    ]),
  ]);
}

export interface FaqCategoryPageJsonLdInput {
  locale: AppLocale;
  categorySlug: string;
  categoryData: TQuestionCategory;
  homeLabel: string;
  allFaqsLabel: string;
}

/** JSON-LD for `/faq/{category}` — `FAQPage` + `BreadcrumbList`. */
export function createFaqCategoryPageJsonLd(
  input: FaqCategoryPageJsonLdInput
): WithContext<Graph> {
  const inLanguage = getJsonLdInLanguage(input.locale);
  const indexUrl = buildLocalizedFaqUrl(input.locale);
  const pageUrl = buildLocalizedFaqUrl(input.locale, input.categorySlug);

  return wrapGraph([
    {
      "@id": pageUrl,
      "@type": "FAQPage",
      inLanguage,
      mainEntity: input.categoryData.questions.map(buildFaqJsonLdQuestion),
    },
    createFaqBreadcrumbList([
      { name: input.homeLabel, url: BASE_URL },
      { name: input.allFaqsLabel, url: indexUrl },
      { name: input.categoryData.category, url: pageUrl },
    ]),
  ]);
}

export interface FaqQuestionPageJsonLdInput {
  locale: AppLocale;
  categorySlug: string;
  categoryName: string;
  question: TQuestionAccordion;
  homeLabel: string;
  allFaqsLabel: string;
}

/** JSON-LD for `/faq/{category}/{slug}` — single-question `FAQPage` + `BreadcrumbList`. */
export function createFaqQuestionPageJsonLd(
  input: FaqQuestionPageJsonLdInput
): WithContext<Graph> {
  const inLanguage = getJsonLdInLanguage(input.locale);
  const indexUrl = buildLocalizedFaqUrl(input.locale);
  const categoryUrl = buildLocalizedFaqUrl(input.locale, input.categorySlug);
  const pageUrl = buildLocalizedFaqUrl(
    input.locale,
    input.categorySlug,
    input.question.slug
  );

  return wrapGraph([
    {
      "@id": pageUrl,
      "@type": "FAQPage",
      inLanguage,
      mainEntity: [buildFaqJsonLdQuestion(input.question)],
    },
    createFaqBreadcrumbList([
      { name: input.homeLabel, url: BASE_URL },
      { name: input.allFaqsLabel, url: indexUrl },
      { name: input.categoryName, url: categoryUrl },
      { name: input.question.question, url: pageUrl },
    ]),
  ]);
}
