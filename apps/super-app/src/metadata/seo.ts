// import { env } from "@cs/env";
import type { Metadata, Viewport } from "next";
import { getTranslations } from "next-intl/server";

// import type { TQuestionCategory } from "@/config/faq/types";
import { LANDING_SECTION } from "@/config/landing-page";
// import { METADATA_PAGE_ID } from "@/config/sanity-config";
import { normalizeAppLocale } from "@/i18n/locale";
import { routing } from "@/i18n/routing";
// import type { TSanityMetadata } from "@/libs/sanity";
// import { METADATA_QUERY, safeSanityFetchWithFallback } from "@/libs/sanity";
// import { stripMarkdown } from "@/utils/commons/helpers";
import { HOME_URL } from "@/utils/constants/url";

// import { buildPageAlternates, withPageAlternates } from "./alternates";
import { BASE_URL } from "./base-url";
import { buildBasicPageMetadata } from "./build-page-metadata";

export { BASE_URL } from "./base-url";

export const SCHEMA_CONTEXT = "https://schema.org" as const;

export const APP_NAME = "Chat Smith";
const LOGO_PATH = "/images/logo-v2.png";

export type WithContext<T> = T & {
  "@context": typeof SCHEMA_CONTEXT;
};

export interface Graph {
  "@graph": readonly unknown[];
}

interface Organization {
  "@type": "Organization";
  name: string;
  url?: string;
}

interface Question {
  "@type": "Question";
  name: string;
  acceptedAnswer: {
    "@type": "Answer";
    text: string;
  };
}

export interface SoftwareApplicationSchema {
  "@type": "SoftwareApplication";
  "@id": string;
  name: string;
  applicationCategory: string;
  operatingSystem: readonly string[];
  url: string;
  description: string;
  featureList: readonly string[];
  publisher: Organization & { url: string };
}

export interface WebSiteSchema {
  "@type": "WebSite";
  "@id": string;
  name: string;
  url: string;
  publisher: Organization;
}

export interface FAQPageSchema {
  "@type": "FAQPage";
  "@id": string;
  mainEntity: readonly Question[];
}

const createOrganization = (name: string, url?: string): Organization => ({
  "@type": "Organization",
  name,
  ...(url && { url }),
});

const createId = (path: string, fragment?: string): string =>
  `${BASE_URL}${path}${fragment ? `#${fragment}` : ""}`;

const organization = createOrganization(APP_NAME, BASE_URL);

const softwareApplication: SoftwareApplicationSchema = {
  "@id": createId(HOME_URL, LANDING_SECTION.FEATURE),
  "@type": "SoftwareApplication",
  applicationCategory: "BusinessApplication",
  description:
    "AI Pro Assistant with all-in-one AI top models including GPT-5, Grok, and Gemini.",
  featureList: [
    "AI Chat",
    "Image Generation",
    "PDF Analysis",
    "Real-time Search",
    "Grammar Enhancement",
  ] as const,
  name: APP_NAME,
  operatingSystem: ["iOS", "Android", "Web"] as const,
  publisher: organization as Organization & { url: string },
  url: `${BASE_URL}/home`,
};

const webSite: WebSiteSchema = {
  "@id": createId("", ""),
  "@type": "WebSite",
  name: APP_NAME,
  publisher: createOrganization(APP_NAME),
  url: BASE_URL,
};

const faqPage: FAQPageSchema = {
  "@id": createId(HOME_URL, LANDING_SECTION.FAQ),
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not at all. Modern platforms offer user-friendly interfaces, templates, and integrations, making it quick and simple to launch your chatbot.",
      },
      name: "Is it difficult to set up chatbot automation?",
    },
  ] as const,
};

/**
 * Creates a FAQPage JSON-LD schema for a specific FAQ category.
 * Follows Google SEO best practices:
 * - One FAQPage per URL
 * - All questions must be visible on the page
 * - Answers must match the UI text (using answer, fallback shortAnswer)
 * - Answers are stripped of markdown for plain text format
 */
// function createFAQPageSchema(
//   categoryData: TQuestionCategory,
//   categorySlug: string
// ): WithContext<FAQPageSchema> {
//   const questions: Question[] = categoryData.questions.map((question) => {
//     // Use the same answer logic as the detail page: answer, fallback shortAnswer
//     const answerText = question.answer?.trim() || question.shortAnswer || "";
//     // Strip markdown to get plain text for JSON-LD
//     const plainTextAnswer = stripMarkdown(answerText);

//     return {
//       "@type": "Question",
//       name: question.question,
//       acceptedAnswer: {
//         "@type": "Answer",
//         text: plainTextAnswer,
//       },
//     };
//   });

//   return {
//     "@context": SCHEMA_CONTEXT,
//     "@type": "FAQPage",
//     "@id": `${BASE_URL}${FAQ_URL}/${categorySlug}`,
//     mainEntity: questions,
//   };
// }

// ============================================================================
// Exports
// ============================================================================

export const homeJsonLdSchema: WithContext<Graph> = {
  "@context": SCHEMA_CONTEXT,
  "@graph": [softwareApplication, webSite, faqPage],
};

const DEFAULT_METADATA_ICONS: Metadata["icons"] = {
  apple: LOGO_PATH,
  icon: LOGO_PATH,
  other: [
    {
      rel: "apple-touch-icon",
      url: LOGO_PATH,
    },
    {
      rel: "mask-icon",
      url: LOGO_PATH,
    },
  ],
};

export async function generateDefaultMetadata(
  locale: string
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "common.metadata" });
  return {
    description: t("description"),
    icons: DEFAULT_METADATA_ICONS,
    keywords: t("keywords"),
    title: t("title"),
  };
}

interface LocalizedPageMetadataOverrides {
  title?: string;
  description?: string;
  keywords?: string;
}

interface LocalizedPageMetadataOptions {
  hrefLangLocales?: readonly string[];
  /** Canonical/hreflang path when it differs from the current route pathname. */
  canonicalPathname?: string;
}

/** Default i18n metadata with canonical URL and hreflang alternates for a localized public path. */
export async function generateLocalizedPageMetadata(
  locale: string,
  pathname: string,
  overrides?: LocalizedPageMetadataOverrides,
  options?: LocalizedPageMetadataOptions
): Promise<Metadata> {
  const lang = normalizeAppLocale(locale);
  const t = await getTranslations({
    locale: lang,
    namespace: "common.metadata",
  });
  const alternatesPathname = options?.canonicalPathname ?? pathname;

  const metadata = buildBasicPageMetadata({
    alternates: {
      hrefLangLocales: options?.hrefLangLocales ?? routing.locales,
      locale: lang,
      pathname: alternatesPathname,
    },
    description: overrides?.description?.trim() || t("description"),
    keywords: overrides?.keywords?.trim() || t("keywords"),
    title: overrides?.title?.trim() || t("title"),
  });

  return {
    ...metadata,
    icons: DEFAULT_METADATA_ICONS,
  };
}

// const CMS_METADATA_PATHS: Record<
//   (typeof METADATA_PAGE_ID)[keyof typeof METADATA_PAGE_ID],
//   string
// > = {
//   [METADATA_PAGE_ID.HOME]: HOME_URL,
// };

// async function generateCMSMetadata(
//   pageId: (typeof METADATA_PAGE_ID)[keyof typeof METADATA_PAGE_ID],
//   locale: string,
//   options?: {
//     pathname?: string;
//     hrefLangLocales?: readonly string[];
//   }
// ): Promise<Metadata> {
//   const t = await getTranslations({ locale, namespace: "common.metadata" });
//   const lang =
//     pageId === METADATA_PAGE_ID.HOME ? normalizeAppLocale(locale) : locale;

//   const metaData = await safeSanityFetchWithFallback<TSanityMetadata>(
//     METADATA_QUERY,
//     {
//       title: "",
//       description: "",
//       keywords: "",
//     } as TSanityMetadata,
//     {
//       pageId,
//       lang,
//     },
//     {
//       next: {
//         revalidate: env.SANITY_REVALIDATE_TIME,
//         tags: ["metadata"],
//       },
//     }
//   );

//   const pathname = options?.pathname ?? CMS_METADATA_PATHS[pageId];
//   const title = metaData.title || t("title");
//   const description = metaData.description || t("description");

//   let metadata: Metadata = {
//     title,
//     description,
//     keywords: metaData.keywords || t("keywords"),
//     icons: DEFAULT_METADATA_ICONS,
//     openGraph: {
//       title,
//       description,
//       type: "website",
//     },
//   };

//   if (pathname) {
//     metadata = withPageAlternates(
//       metadata,
//       buildPageAlternates({
//         locale,
//         pathname,
//         hrefLangLocales: options?.hrefLangLocales ?? routing.locales,
//       })
//     );
//   }

//   return metadata;
// }

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Allow zoom for accessibility (Lighthouse).
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

const commonMetadata = {
  icons: {
    apple: LOGO_PATH,
    icon: LOGO_PATH,
    other: [
      {
        rel: "apple-touch-icon",
        url: LOGO_PATH,
      },
      {
        rel: "mask-icon",
        url: LOGO_PATH,
      },
    ],
  },
  keywords:
    "chatgpt, ai, gpt, ai image generator, ai chat, ai chatbot, gpt4, dalle, chatbot, productivity, ai web, text to image, gpt4o, math gpt, ai writing, ai homework help, ai email writer, ai content generator, ai artwork",
};

const metadata: Metadata = {
  description:
    "Chat Smith, powered by ChatGPT API and GPT-4o model delivers enhanced AI Chat app capabilities, voice interaction, write email, solve math homework and intelligent conversational experience for all your need",
  title: "AI Chatbot: AI Chat Smith 5",

  ...commonMetadata,
};

// const guestMetadata: Metadata = {
//   title: "Chat Smith: Best Multi-Model AI Chatbot for Work & Study",
//   description:
//     "Access GPT-5, Gemini, Grok, and DeepSeek in Chat Smith - your AI assistant for productivity. Write, research, analyze, and generate images effortlessly on web & mobile. Try for free.",
//   ...commonMetadata,
// };

export default metadata;
