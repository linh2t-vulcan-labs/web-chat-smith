import ChatsmithMark from "@/public/icons/landing-page/Icon-chatsmith.svg?react";

import { getAIToolTranslation } from "../../translations/translattion";
import type { AIToolSectionComponentProps } from "../../types/types";

import styles from "./styles.module.css";

export type AIToolSectionProps = AIToolSectionComponentProps;

export default async function AIToolMetricSection({
  data,
}: AIToolSectionProps) {
  const { t } = await getAIToolTranslation();

  const prefix = data?.richText?.prefix ?? t("metrics.title.prefix");
  const highlight = data?.richText?.main ?? t("metrics.title.highlight");
  const suffix = data?.richText?.suffix ?? t("metrics.title.suffix");

  const metrics = data?.items?.length ? data?.items : [];

  const sectionAria = data?.name || t("metrics.aria.section");
  const listAria = t("metrics.aria.list");

  return (
    <section className={styles.section} aria-label={sectionAria}>
      <div className={styles.sectionDecor} aria-hidden>
        <span className={styles.sectionChatsmithMobile}>
          <ChatsmithMark className={styles.sectionChatsmithIcon} />
        </span>
        <span className={styles.sectionChatsmithDesktopTL}>
          <ChatsmithMark className={styles.sectionChatsmithIcon} />
        </span>
        <span className={styles.sectionChatsmithDesktopBR}>
          <ChatsmithMark className={styles.sectionChatsmithIcon} />
        </span>
      </div>
      <div className={styles.container}>
        <h2 className={styles.title}>
          <span className={styles.titlePrefix}>{prefix}</span>
          <span className={styles.titleRow}>
            <span className={styles.titleHighlight}>{highlight}</span>
            {highlight && suffix ? " " : null}
            <span className={styles.titleSuffix}>{suffix}</span>
          </span>
        </h2>

        <ul className={styles.cards} aria-label={listAria}>
          {metrics.map((m) => (
            <li key={m?._key || `${m?.title}`} className={styles.card}>
              <span className={styles.cardChatsmithWrap} aria-hidden>
                <ChatsmithMark className={styles.cardChatsmithIcon} />
              </span>
              <div className={styles.metricValue}>{m?.title}</div>
              <div className={styles.metricText}>{m?.description}</div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
