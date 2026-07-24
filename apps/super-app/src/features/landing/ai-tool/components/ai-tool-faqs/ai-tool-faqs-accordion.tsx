import { PortableText } from "@portabletext/react";
import type { PortableTextComponents } from "@portabletext/react";

import type { AiToolFaqQaPair } from "@/libs/sanity/sanity.types";
import ArrowIcon from "@/public/icons/landing-page/arrow.svg?react";

import styles from "./styles.module.css";

export interface AIToolFAQsAccordionItem {
  key: string;
  question: string;
  answer: AiToolFaqQaPair["answer"];
  answerPlain?: string;
}

function hasPortableAnswer(answer: AiToolFaqQaPair["answer"]): boolean {
  return Array.isArray(answer) && answer.length > 0;
}

interface Props {
  items: AIToolFAQsAccordionItem[];
  sectionTitleId?: string;
}

const portableComponents: PortableTextComponents = {
  block: {
    blockquote: ({ children }) => <blockquote>{children}</blockquote>,
    h1: ({ children }) => <h2>{children}</h2>,
    h2: ({ children }) => <h3>{children}</h3>,
    h3: ({ children }) => <h4>{children}</h4>,
    h4: ({ children }) => <h5>{children}</h5>,
    h5: ({ children }) => <h6>{children}</h6>,
    h6: ({ children }) => <h6>{children}</h6>,
    normal: ({ children }) => <p>{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul>{children}</ul>,
    number: ({ children }) => <ol>{children}</ol>,
  },
  marks: {
    link: ({ value, children }) => (
      <a href={value?.href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
  },
};

function AIToolFaqAnswerPortable({
  value,
}: {
  value: NonNullable<AiToolFaqQaPair["answer"]>;
}) {
  return (
    <div className={styles.answer}>
      <PortableText value={value} components={portableComponents} />
    </div>
  );
}

function AIToolFaqAnswerPlain({ text }: { text: string }) {
  return (
    <div className={styles.answer}>
      <p>{text}</p>
    </div>
  );
}

/**
 * Native `<details>` / `<summary>` for disclosure semantics.
 */
export default function AIToolFAQsAccordion({ items, sectionTitleId }: Props) {
  return (
    <div className={styles.list} aria-labelledby={sectionTitleId}>
      {items.map((item) => {
        const showPortable = hasPortableAnswer(item.answer);
        const plainText = item.answerPlain?.trim() ?? "";
        const showPlain = !showPortable && plainText.length > 0;

        return (
          <details key={item.key} className={styles.item}>
            <summary className={styles.summary}>
              <span className={styles.question}>{item.question}</span>
              <ArrowIcon
                className={styles.chevron}
                width={20}
                height={20}
                aria-hidden="true"
              />
            </summary>
            {showPortable || showPlain ? (
              <div className={styles.contentInner}>
                {showPortable && item.answer ? (
                  <AIToolFaqAnswerPortable value={item.answer} />
                ) : (
                  <AIToolFaqAnswerPlain text={plainText} />
                )}
              </div>
            ) : null}
          </details>
        );
      })}
    </div>
  );
}
