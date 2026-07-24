import type { AiToolFAQs } from "@/libs/sanity/sanity.types";

import { getAIToolTranslation } from "../../translations/translattion";
import { pickFaqRowsForLocale } from "../../utils/faq-items";
import AIToolFAQsAccordion from "./ai-tool-faqs-accordion";
import type { AIToolFAQsAccordionItem } from "./ai-tool-faqs-accordion";

import styles from "./styles.module.css";

/**
 * FAQ — design reference (Figma):
 * - Title: https://www.figma.com/design/5gC1w9caiBlpmV5h5GVcq0/Landing-Page--Trang-V%C5%A9-?node-id=1-8312
 * - Section: https://www.figma.com/design/5gC1w9caiBlpmV5h5GVcq0/Landing-Page--Trang-V%C5%A9-?node-id=1-8311
 */

function mapFaqRowsToAccordionItems(
  rows: ReturnType<typeof pickFaqRowsForLocale>
): AIToolFAQsAccordionItem[] {
  return rows.map((row, idx) => {
    const key = row._key || `faq-row-${idx + 1}`;
    const question = row.question?.trim() ?? "";
    const { answer } = row;
    const answerPlain = row.answerPlain?.trim() || undefined;
    return { answer, answerPlain, key, question };
  });
}

export interface AIToolFAQsProps {
  faq: AiToolFAQs | null | undefined;
}

export default async function AIToolFAQs({ faq }: AIToolFAQsProps) {
  const { locale, t } = await getAIToolTranslation();
  const items = mapFaqRowsToAccordionItems(
    pickFaqRowsForLocale(faq?.itemsByLocale, locale)
  );

  if (!items.length) {
    return null;
  }

  const titlePrefix = t("faq.title.prefix");
  const titleMain = t("faq.title.main");
  const sectionAriaLabel =
    [titlePrefix, titleMain].filter(Boolean).join(" ").trim() ||
    t("faq.sectionAria");
  const titleId = "ai-tool-faq-section-title";

  return (
    <section className={styles.section} aria-label={sectionAriaLabel}>
      <div className={styles.inner}>
        <h2 id={titleId} className={styles.title}>
          <span className={styles.titlePrefix}>{titlePrefix}</span>{" "}
          <span className={styles.titleMain}>{titleMain}</span>
        </h2>
        <AIToolFAQsAccordion items={items} sectionTitleId={titleId} />
      </div>
    </section>
  );
}
