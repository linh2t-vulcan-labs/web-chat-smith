import { FAQ_DATA_EN } from "./en";
import type { TQuestionCategory, TQuestionCategoryRaw } from "./types";

/**
 * Stable FAQ URL segment from English (or any) source text.
 * Avoids encodeURIComponent so route params match after Next.js decoding.
 */
export function faqSegmentSlug(text: string): string {
  const withHyphens = text
    .toLowerCase()
    .trim()
    .replaceAll(/\s+/gu, "-")
    .replaceAll(/[^a-z0-9-]+/gu, "-")
    .replaceAll(/-+/gu, "-");
  return withHyphens.replace(/^-+/u, "").replace(/-+$/u, "");
}

function buildCategorySlugs(): Record<number, string> {
  const map: Record<number, string> = {};
  for (const cat of FAQ_DATA_EN) {
    map[cat.id] = faqSegmentSlug(cat.category);
  }
  return map;
}

function buildQuestionSlugs(): Record<number, Record<number, string>> {
  const map: Record<number, Record<number, string>> = {};
  for (const cat of FAQ_DATA_EN) {
    const questionSlugs: Record<number, string> = {};
    for (const q of cat.questions) {
      questionSlugs[q.id] = faqSegmentSlug(q.question);
    }
    map[cat.id] = questionSlugs;
  }
  return map;
}

const FAQ_CATEGORY_SLUGS = buildCategorySlugs();
const FAQ_QUESTION_SLUGS = buildQuestionSlugs();

export function attachCanonicalFaqSlugs(
  raw: TQuestionCategoryRaw[]
): TQuestionCategory[] {
  return raw.map((cat) => {
    const categorySlug = FAQ_CATEGORY_SLUGS[cat.id];
    const questionMap = FAQ_QUESTION_SLUGS[cat.id];
    if (!categorySlug || !questionMap) {
      throw new Error(`FAQ canonical slugs: missing category id ${cat.id}`);
    }

    return {
      ...cat,
      questions: cat.questions.map((q) => {
        const questionSlug = questionMap[q.id];
        if (!questionSlug) {
          throw new Error(
            `FAQ canonical slugs: missing question categoryId=${cat.id} questionId=${q.id}`
          );
        }
        return { ...q, slug: questionSlug };
      }),
      slug: categorySlug,
    };
  });
}
