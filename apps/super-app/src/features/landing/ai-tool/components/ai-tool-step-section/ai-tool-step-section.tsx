import { getAIToolTranslation } from "../../translations/translattion";
import type {
  AIToolSectionPageContext,
  AIToolSectionWithCtaProps,
  AiToolSectionResolved,
} from "../../types/types";
import { buildAiToolBannerConversationPathname } from "../../utils";
import {
  AIToolFeaturePageGenerateCtaIcon,
  AIToolFeaturePageGenerateLink,
} from "../ai-tool-feature-page-generate-link/ai-tool-feature-page-generate-link";

import styles from "./styles.module.css";

/**
 * Design (Figma):
 * - Mobile: https://www.figma.com/design/5gC1w9caiBlpmV5h5GVcq0/Landing-Page--Trang-V%C5%A9-?node-id=12-9563
 * - Desktop: https://www.figma.com/design/5gC1w9caiBlpmV5h5GVcq0/Landing-Page--Trang-V%C5%A9-?node-id=1-8266
 */

export type AIToolStepSectionProps = AIToolSectionWithCtaProps;

type StepTranslate = Awaited<ReturnType<typeof getAIToolTranslation>>["t"];

function resolveStepConversationHref(
  page: AIToolSectionPageContext | undefined
): string {
  return page?.redirectLink?.trim() || buildAiToolBannerConversationPathname();
}

function resolveStepItems(data: AiToolSectionResolved | null | undefined) {
  return data?.items?.length ? data?.items : [];
}

function resolveStepSectionText(
  data: AiToolSectionResolved | null | undefined,
  t: StepTranslate
) {
  return {
    highlight: data?.richText?.main ?? t("steps.title.highlight"),
    prefix: data?.richText?.prefix ?? t("steps.title.prefix"),
    sectionAria: data?.name || t("steps.aria.section"),
    subtitle: data?.subTitle ?? t("steps.subtitle"),
    suffix: data?.richText?.suffix ?? t("steps.title.suffix"),
  };
}

export default async function AIToolStepSection({
  data,
  page,
}: AIToolStepSectionProps) {
  const { t } = await getAIToolTranslation();
  const conversationHref = resolveStepConversationHref(page);

  const { prefix, highlight, suffix, subtitle, sectionAria } =
    resolveStepSectionText(data, t);

  const items = resolveStepItems(data);

  const listAria = t("steps.aria.list");
  const ctaLabel = t("steps.cta.generate");
  const ctaLabelShort = t("steps.cta.generateShort");

  return (
    <section className={styles.section} aria-label={sectionAria}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            <span className={styles.titlePrefix}>{prefix}</span>{" "}
            <span className={styles.titleHighlight}>{highlight}</span>
            {highlight && suffix ? " " : null}
            <span className={styles.titleSuffix}>{suffix}</span>
          </h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </header>

        <div className={styles.stepsBody}>
          <ul className={styles.list} aria-label={listAria}>
            {items.map((it) => (
              <li
                key={it?._key || it?.title || it?.description}
                className={styles.item}
              >
                <h3 className={styles.itemTitle}>{it?.title}</h3>
                <p className={styles.itemDescription}>{it?.description}</p>
              </li>
            ))}
          </ul>

          <AIToolFeaturePageGenerateLink
            className={styles.cta}
            href={conversationHref}
            section="step"
            ariaLabel={ctaLabel}
          >
            <span className={styles.ctaLabel} aria-hidden>
              <span className={styles.ctaLabelMobile}>{ctaLabelShort}</span>
              <span className={styles.ctaLabelDesktop}>{ctaLabel}</span>
            </span>
            <AIToolFeaturePageGenerateCtaIcon className={styles.ctaIcon} />
          </AIToolFeaturePageGenerateLink>
        </div>
      </div>
    </section>
  );
}
