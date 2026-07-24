import type { Metadata, Route } from "next";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";

import { FaqMarkdown } from "@/components/faq-markdown";
import { getFaqDataByLocale } from "@/config/faq/get-faq-data";
import { createFaqQuestionPageJsonLd } from "@/features/faq/faq-json-ld";
import { generateFaqMetadata } from "@/features/faq/metadata";
import { normalizeAppLocale } from "@/i18n/locale";
import JsonLdScript from "@/metadata/json-ld-script";
import { findFAQCategoryBySlug, findQuestionBySlug } from "@/utils/commons/faq";
import {
  capitalizeFirstLetter,
  getNameFromSlug,
  stripMarkdown,
} from "@/utils/commons/helpers";
import { FAQ_URL } from "@/utils/constants/url";

interface TPageParams {
  params: Promise<{
    locale: string;
    category: string;
    slug: string;
  }>;
}

export async function generateMetadata(props: TPageParams): Promise<Metadata> {
  const params = await props.params;
  const lang = normalizeAppLocale(params.locale);
  const faqList = await getFaqDataByLocale(lang);
  const faqData = findFAQCategoryBySlug(params.category, faqList);
  const questionData = faqData
    ? findQuestionBySlug(params.slug, faqData.questions)
    : undefined;

  const title = questionData
    ? capitalizeFirstLetter(questionData.question)
    : capitalizeFirstLetter(getNameFromSlug(params.slug));

  const answerText = questionData?.answer?.trim() || questionData?.shortAnswer;
  const description = answerText ? stripMarkdown(answerText) : undefined;
  const categorySlug = faqData?.slug ?? params.category;
  const questionSlug = questionData?.slug ?? params.slug;

  return generateFaqMetadata({
    categorySlug,
    description,
    locale: lang,
    questionSlug,
    title,
  });
}

export default async function Page(props: TPageParams) {
  const params = await props.params;
  const lang = normalizeAppLocale(params.locale);
  const faqList = await getFaqDataByLocale(lang);
  const categorySlug = params.category;
  const questionSlug = params.slug;
  const faqData = findFAQCategoryBySlug(categorySlug, faqList);

  if (!faqData) {
    redirect(FAQ_URL);
  }

  const questionData = findQuestionBySlug(questionSlug, faqData.questions);

  if (!questionData) {
    redirect(`${FAQ_URL}/${faqData.slug ?? params.category}` as Route);
  }

  const canonicalCategory = faqData.slug ?? categorySlug;
  const canonicalQuestion = questionData.slug ?? questionSlug;
  if (
    canonicalCategory !== categorySlug ||
    canonicalQuestion !== questionSlug
  ) {
    redirect(`${FAQ_URL}/${canonicalCategory}/${canonicalQuestion}`);
  }

  const [tFaqPage, tPricing] = await Promise.all([
    getTranslations({ locale: lang, namespace: "faqPage.breadcrumb" }),
    getTranslations({ locale: lang, namespace: "pricing" }),
  ]);

  const faqQuestionPageJsonLd = createFaqQuestionPageJsonLd({
    allFaqsLabel: tFaqPage("allFaqs"),
    categoryName: faqData.category,
    categorySlug: canonicalCategory,
    homeLabel: tPricing("breadcrumb.home"),
    locale: lang,
    question: questionData,
  });

  return (
    <>
      <JsonLdScript schema={faqQuestionPageJsonLd} />
      <div className="flex flex-col">
        <h3 className="lg:text-app-Title0 mb-large-4 text-app-Title1 lg:mb-large-6">
          {questionData.question}
        </h3>
        <div className="prose prose-light max-w-none">
          <FaqMarkdown>{questionData.answer}</FaqMarkdown>
        </div>
      </div>
    </>
  );
}
