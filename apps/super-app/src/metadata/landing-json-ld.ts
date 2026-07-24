import type { AIToolLocale } from "@/features/landing/ai-tool/translations/config";
import {
  buildAiToolGroupPath,
  buildAiToolPagePath,
  buildLocalizedPublicHref,
  formatAiToolGroupToDisplayName,
  formatAiToolSlugToDisplayName,
} from "@/features/landing/ai-tool/utils";
import type { AiToolGroupSegment } from "@/features/landing/ai-tool/utils";
import { buildFaqJsonLdQuestions } from "@/features/landing/ai-tool/utils/faq-items";
import type { FaqJsonLdQuestion } from "@/features/landing/ai-tool/utils/faq-items";
import { buildPricingPageHref } from "@/features/landing/pricing/utils/home-href";
import { pickAiSeoLocaleContent } from "@/libs/sanity/ai-seo-metadata";
import type { AiSeo, AiToolFAQs } from "@/libs/sanity/sanity.types";

import { APP_NAME, BASE_URL, SCHEMA_CONTEXT } from "./seo";
import type { Graph, WithContext } from "./seo";

const PRICING_WEBPAGE_DESCRIPTION_FALLBACK =
  "Compare Chat Smith plans and choose the right subscription.";

const PRICING_FAQ_FALLBACK: FaqJsonLdQuestion[] = [
  {
    "@type": "Question",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Yes. You can use Chat Smith for free with limited access. Upgrade to PRO to unlock premium AI models, higher usage limits, AI image generation, and advanced features.",
    },
    name: "Is there a free version of Chat Smith?",
  },
  {
    "@type": "Question",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Chat Smith Pro includes higher usage limits, advanced AI models, and premium features.",
    },
    name: "What is included in Chat Smith Pro?",
  },
  {
    "@type": "Question",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Yes. You can cancel your subscription at any time from your account settings.",
    },
    name: "Can I cancel my subscription anytime?",
  },
  {
    "@type": "Question",
    acceptedAnswer: {
      "@type": "Answer",
      text: "Chat Smith accepts major payment methods supported by the App Store, Google Play, and web checkout, depending on your location and platform.",
    },
    name: "Which payment methods do you accept?",
  },
];

const PRICING_OFFER_CATALOG_NAME = "Chat Smith Pricing Plans";

const JSON_LD_LANGUAGES = {
  ar: "ar-SA",
  en: "en-US",
  es: "es-ES",
  hi: "hi-IN",
  ja: "ja-JP",
  ko: "ko-KR",
  th: "th-TH",
  zh: "zh-CN",
} as const satisfies Record<AIToolLocale, string>;

function isJsonLdLanguageKey(
  locale: string
): locale is keyof typeof JSON_LD_LANGUAGES {
  return locale in JSON_LD_LANGUAGES;
}

function getJsonLdInLanguage(locale: AIToolLocale): string {
  return isJsonLdLanguageKey(locale)
    ? JSON_LD_LANGUAGES[locale]
    : JSON_LD_LANGUAGES.en;
}

function getAiToolDescriptionFallback(
  group: AiToolGroupSegment,
  slug: string
): string {
  if (group === "image" && slug === "image-generator") {
    return "Generate AI images from text prompts in seconds.";
  }

  return "Explore Chat Smith's AI tools to create, learn, and work faster.";
}

function createPublisher() {
  return {
    "@type": "Organization" as const,
    name: APP_NAME,
  };
}

function createFreeOffer() {
  return {
    "@type": "Offer" as const,
    price: "0",
    priceCurrency: "USD",
  };
}

function createBreadcrumbList(
  homeLabel: string,
  homeUrl: string,
  pageLabel: string,
  pageUrl?: string,
  middleStep?: { label: string; url: string }
) {
  const items: {
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }[] = [
    {
      "@type": "ListItem",
      item: homeUrl,
      name: homeLabel,
      position: 1,
    },
  ];

  if (middleStep) {
    items.push({
      "@type": "ListItem",
      item: middleStep.url,
      name: middleStep.label,
      position: 2,
    });
  }

  items.push({
    "@type": "ListItem",
    name: pageLabel,
    position: middleStep ? 3 : 2,
    ...(pageUrl ? { item: pageUrl } : {}),
  });

  return {
    "@type": "BreadcrumbList" as const,
    itemListElement: items,
  };
}

function wrapGraph(schemas: unknown[]): WithContext<Graph> {
  return {
    "@context": SCHEMA_CONTEXT,
    "@graph": schemas,
  };
}

function createPricingBreadcrumbList(homeLabel: string, pageLabel: string) {
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
        name: pageLabel,
        position: 2,
      },
    ],
  };
}

function createPricingOfferCatalog(pageUrl: string) {
  return {
    "@type": "OfferCatalog" as const,
    itemListElement: [
      {
        "@type": "Offer" as const,
        name: "Chat Smith Pro Monthly",
        priceSpecification: {
          "@type": "UnitPriceSpecification" as const,
          price: "9.99",
          priceCurrency: "USD",
          unitCode: "MON",
        },
        url: pageUrl,
      },
      {
        "@type": "Offer" as const,
        name: "Chat Smith Pro Yearly",
        priceSpecification: {
          "@type": "UnitPriceSpecification" as const,
          price: "39.99",
          priceCurrency: "USD",
          unitCode: "ANN",
        },
        url: pageUrl,
      },
    ],
    name: PRICING_OFFER_CATALOG_NAME,
  };
}

export interface AiToolPageJsonLdInput {
  locale: AIToolLocale;
  group: AiToolGroupSegment;
  slug: string;
  title?: string | null;
  seo?: AiSeo | null;
  faq?: AiToolFAQs | null;
  homeLabel: string;
  groupLabel?: string;
}

export function createAiToolPageJsonLd(
  input: AiToolPageJsonLdInput
): WithContext<Graph> {
  const inLanguage = getJsonLdInLanguage(input.locale);
  const pageTitle =
    input.title?.trim() || formatAiToolSlugToDisplayName(input.slug);
  const pagePath = buildAiToolPagePath(input.group, input.slug);
  const pageUrl = `${BASE_URL}${buildLocalizedPublicHref(input.locale, pagePath)}`;
  const homeUrl = `${BASE_URL}${buildLocalizedPublicHref(input.locale, "/home")}`;
  const groupPath = buildAiToolGroupPath(input.group);
  const groupUrl = `${BASE_URL}${buildLocalizedPublicHref(input.locale, groupPath)}`;
  const groupLabel =
    input.groupLabel || formatAiToolGroupToDisplayName(input.group);
  const seoContent = pickAiSeoLocaleContent(input.seo, input.locale);
  const description =
    seoContent?.description?.trim() ||
    getAiToolDescriptionFallback(input.group, input.slug);

  const graph: unknown[] = [
    {
      "@type": "SoftwareApplication",
      applicationCategory: "MultimediaApplication",
      description,
      inLanguage,
      name: pageTitle,
      offers: createFreeOffer(),
      operatingSystem: "Web",
      publisher: createPublisher(),
      url: pageUrl,
    },
    createBreadcrumbList(input.homeLabel, homeUrl, pageTitle, undefined, {
      label: groupLabel,
      url: groupUrl,
    }),
  ];

  const faqQuestions = buildFaqJsonLdQuestions(input.faq, input.locale);
  if (faqQuestions.length > 0) {
    graph.push({
      "@type": "FAQPage",
      inLanguage,
      mainEntity: faqQuestions,
    });
  }

  return wrapGraph(graph);
}

export interface PricingPageJsonLdInput {
  locale: AIToolLocale;
  seo?: AiSeo | null;
  faq?: AiToolFAQs | null;
  homeLabel: string;
  pageLabel: string;
}

export function createPricingPageJsonLd(
  input: PricingPageJsonLdInput
): WithContext<Graph> {
  const inLanguage = getJsonLdInLanguage(input.locale);
  const pageUrl = `${BASE_URL}${buildPricingPageHref(input.locale)}`;
  const seoContent = pickAiSeoLocaleContent(input.seo, input.locale);
  const description =
    seoContent?.description?.trim() || PRICING_WEBPAGE_DESCRIPTION_FALLBACK;
  const faqQuestions = buildFaqJsonLdQuestions(input.faq, input.locale);

  return wrapGraph([
    {
      "@type": "WebPage",
      description,
      inLanguage,
      name: input.pageLabel,
      url: pageUrl,
    },
    createPricingBreadcrumbList(input.homeLabel, input.pageLabel),
    createPricingOfferCatalog(pageUrl),
    {
      "@type": "FAQPage",
      inLanguage,
      mainEntity: faqQuestions.length > 0 ? faqQuestions : PRICING_FAQ_FALLBACK,
    },
  ]);
}

export interface AiToolGroupPageJsonLdInput {
  locale: AIToolLocale;
  group: AiToolGroupSegment;
  title: string;
  description?: string;
  homeLabel: string;
  groupLabel?: string;
}

export function createAiToolGroupPageJsonLd(
  input: AiToolGroupPageJsonLdInput
): WithContext<Graph> {
  const inLanguage = getJsonLdInLanguage(input.locale);
  const groupLabel =
    input.groupLabel || formatAiToolGroupToDisplayName(input.group);
  const groupPath = buildAiToolGroupPath(input.group);
  const groupUrl = `${BASE_URL}${buildLocalizedPublicHref(input.locale, groupPath)}`;
  const homeUrl = `${BASE_URL}${buildLocalizedPublicHref(input.locale, "/")}`;

  return wrapGraph([
    {
      "@type": "WebPage",
      description: input.description,
      inLanguage,
      name: input.title,
      publisher: createPublisher(),
      url: groupUrl,
    },
    createBreadcrumbList(input.homeLabel, homeUrl, groupLabel, groupUrl),
  ]);
}
