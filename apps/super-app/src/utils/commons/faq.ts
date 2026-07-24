import { faqSegmentSlug } from "@/config/faq/faq-canonical-slugs";
import type { TQuestionAccordion, TQuestionCategory } from "@/config/faq/types";
import { createSlug } from "@/utils/commons/helpers";

export function getFaqCategoryPathSegment(cat: TQuestionCategory): string {
  return cat.slug;
}

export function getFaqQuestionPathSegment(q: TQuestionAccordion): string {
  return q.slug;
}

export function extractAllFaqQuestion(faqData: TQuestionCategory[]) {
  const acc: (TQuestionAccordion & {
    category: string;
    categoryPathSegment: string;
  })[] = [];

  for (const faqCat of faqData) {
    const categoryQuestions = faqCat.questions.map((q) => ({
      category: faqCat.category,
      categoryPathSegment: getFaqCategoryPathSegment(faqCat),
      ...q,
    }));
    acc.push(...categoryQuestions);
  }

  return acc;
}

/**
 * Finds an FAQ category by URL segment (canonical slug, legacy `id-slug`, or localized slugs).
 */
export function findFAQCategoryBySlug(
  slug: string,
  faqData: TQuestionCategory[]
): TQuestionCategory | undefined {
  const normalizedSlug = faqSegmentSlug(slug);
  return faqData.find((faqItem) => {
    if (getFaqCategoryPathSegment(faqItem) === slug) {
      return true;
    }
    if (faqItem.slug === slug) {
      return true;
    }
    if (faqItem.slug === normalizedSlug) {
      return true;
    }
    const legacyIdPrefixed = `${faqItem.id}-${faqItem.slug}`;
    if (legacyIdPrefixed === slug) {
      return true;
    }
    const legacyFull = `${faqItem.id}-${createSlug(faqItem.category)}`;
    const legacyCat = createSlug(faqItem.category);
    return legacyFull === slug || legacyCat === slug;
  });
}

/**
 * Finds a question by URL segment (canonical slug, legacy `id-slug`, or localized slugs).
 */
export function findQuestionBySlug(
  questionSlug: string,
  questions: TQuestionAccordion[]
): TQuestionAccordion | undefined {
  const normalizedSlug = faqSegmentSlug(questionSlug);
  return questions.find((q) => {
    if (getFaqQuestionPathSegment(q) === questionSlug) {
      return true;
    }
    if (q.slug === questionSlug) {
      return true;
    }
    if (q.slug === normalizedSlug) {
      return true;
    }
    const legacyIdPrefixed = `${q.id}-${q.slug}`;
    if (legacyIdPrefixed === questionSlug) {
      return true;
    }
    if (createSlug(q.question) === questionSlug) {
      return true;
    }
    if (`${q.id}-${createSlug(q.question)}` === questionSlug) {
      return true;
    }
    return false;
  });
}
