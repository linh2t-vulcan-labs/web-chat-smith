import type {
  AiToolFaqItemsByLocale,
  AiToolFaqQaPair,
  AiToolFAQs,
} from "@/libs/sanity/sanity.types";

import { AI_TOOL_LOCALES } from "../translations/config";
import type { AIToolLocale } from "../translations/config";
import { pickByLocaleKey } from "./locale-record";

export interface FaqJsonLdQuestion {
  "@type": "Question";
  name: string;
  acceptedAnswer: {
    "@type": "Answer";
    text: string;
  };
}

/** Recursively collects plain text from Sanity portable text (blocks, lists, spans). */
function portableTextToPlain(answer?: AiToolFaqQaPair["answer"]): string {
  if (!Array.isArray(answer) || answer.length === 0) {
    return "";
  }

  const texts: string[] = [];

  const walk = (node: unknown): void => {
    if (node === null || node === undefined) {
      return;
    }

    if (typeof node === "string") {
      const trimmed = node.trim();
      if (trimmed) {
        texts.push(trimmed);
      }
      return;
    }

    if (Array.isArray(node)) {
      for (const item of node) {
        walk(item);
      }
      return;
    }

    if (typeof node === "object") {
      const record = node as Record<string, unknown>;
      if (typeof record.text === "string") {
        const trimmed = record.text.trim();
        if (trimmed) {
          texts.push(trimmed);
        }
      }
      for (const value of Object.values(record)) {
        walk(value);
      }
    }
  };

  walk(answer);
  return texts.join(" ").replaceAll(/\s+/gu, " ").trim();
}

function getFaqAnswerPlainText(row: AiToolFaqQaPair): string {
  return row.answerPlain?.trim() || portableTextToPlain(row.answer);
}

function isFaqRowVisibleOnPage(row: AiToolFaqQaPair): boolean {
  const question = row.question?.trim() ?? "";
  const hasPortableAnswer = Array.isArray(row.answer) && row.answer.length > 0;
  const hasPlainAnswer = Boolean(row.answerPlain?.trim());
  return Boolean(question) || hasPortableAnswer || hasPlainAnswer;
}

export function pickFaqRowsForLocale(
  itemsByLocale: AiToolFaqItemsByLocale | undefined,
  locale: AIToolLocale
): (AiToolFaqQaPair & { _key?: string })[] {
  if (!itemsByLocale) {
    return [];
  }

  let rows = pickByLocaleKey(itemsByLocale, locale);
  if (!Array.isArray(rows) || rows.length === 0) {
    for (const loc of AI_TOOL_LOCALES) {
      const candidate = pickByLocaleKey(itemsByLocale, loc);
      if (Array.isArray(candidate) && candidate.length > 0) {
        rows = candidate;
        break;
      }
    }
  }

  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.filter(Boolean).filter(isFaqRowVisibleOnPage);
}

export function buildFaqJsonLdQuestions(
  faq: AiToolFAQs | null | undefined,
  locale: AIToolLocale
): FaqJsonLdQuestion[] {
  return pickFaqRowsForLocale(faq?.itemsByLocale, locale)
    .map((row) => {
      const question = row.question?.trim() ?? "";
      const answerText = getFaqAnswerPlainText(row);
      if (!question || !answerText) {
        return null;
      }

      return {
        "@type": "Question" as const,
        acceptedAnswer: {
          "@type": "Answer" as const,
          text: answerText,
        },
        name: question,
      };
    })
    .filter((item): item is FaqJsonLdQuestion => item !== null);
}
