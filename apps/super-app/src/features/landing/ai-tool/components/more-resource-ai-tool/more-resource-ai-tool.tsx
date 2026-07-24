import type { AiToolRichText } from "@/libs/sanity/sanity.types";

import { getMoreResourceAiTools } from "../../sanity/get-more-resource-ai-tools";
import { normalizeAIToolLocale } from "../../translations/config";
import { getAIToolTranslation } from "../../translations/translattion";
import type {
  AIToolSectionPageContext,
  MoreResourceAiTool,
} from "../../types/types";
import { MoreResourceAIToolCarousel } from "./more-resource-ai-tool-carousel";
import type { MoreResourceCardItem } from "./more-resource-ai-tool-carousel";

import styles from "./styles.module.css";

/**
 * Design (Figma):
 * - Mobile: https://www.figma.com/design/5gC1w9caiBlpmV5h5GVcq0/Landing-Page--Trang-V%C5%A9-?node-id=12-9583
 * - Desktop: https://www.figma.com/design/5gC1w9caiBlpmV5h5GVcq0/Landing-Page--Trang-V%C5%A9-?node-id=1-8286
 */

export interface MoreResourceAIToolProps {
  language: string;
  page: AIToolSectionPageContext;
  linkAiTool?: MoreResourceAiTool | null;
}

function resolveMoreResourceHeading(
  richText: AiToolRichText | null | undefined,
  defaultMain: string
): { prefix: string; highlight: string; suffix: string } {
  const prefix = richText?.prefix?.trim() ?? "";
  const highlight = richText?.main?.trim() ?? "";
  const suffix = richText?.suffix?.trim() ?? "";

  if (prefix || highlight || suffix) {
    return { highlight, prefix, suffix };
  }

  return { highlight: defaultMain, prefix: "", suffix: "" };
}

export default async function MoreResourceAITool({
  language,
  page,
  linkAiTool,
}: MoreResourceAIToolProps) {
  const groupIds = linkAiTool?.groupIds?.filter(Boolean) ?? [];
  if (!groupIds.length) {
    return null;
  }

  const locale = normalizeAIToolLocale(language);
  const { t } = await getAIToolTranslation(locale);

  const cards = await getMoreResourceAiTools({
    exclude: { group: page.group, slug: page.slug },
    groupIds,
    language,
  });

  if (!cards.length) {
    return null;
  }

  const resolvedItems: MoreResourceCardItem[] = cards.map((card) => ({
    description: card.description,
    href: card.href,
    imageUrl: card.imageUrl,
    key: card.id,
    title: card.title,
  }));

  const defaultMain = t("horizontalCards.defaults.main");
  const defaultSubtitle = t("horizontalCards.defaults.subtitle");
  const { prefix, highlight, suffix } = resolveMoreResourceHeading(
    linkAiTool?.richText,
    defaultMain
  );

  const sectionAria = t("horizontalCards.aria.section");
  const listAria = t("horizontalCards.aria.list");
  const prevAriaLabel = t("horizontalCards.aria.previous");
  const nextAriaLabel = t("horizontalCards.aria.next");
  const subtitle = linkAiTool?.subTitle?.trim() || defaultSubtitle;

  return (
    <section className={styles.section} aria-label={sectionAria}>
      <div className={styles.inner}>
        <header className={styles.header}>
          <h2 className={styles.title}>
            {prefix ? (
              <span className={styles.titlePrefix}>{prefix} </span>
            ) : null}
            {highlight ? (
              <span className={styles.titleHighlight}>{highlight}</span>
            ) : null}
            {suffix ? (
              <>
                {highlight ? " " : null}
                <span className={styles.titleSuffix}>{suffix}</span>
              </>
            ) : null}
          </h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </header>

        <MoreResourceAIToolCarousel
          items={resolvedItems}
          listAria={listAria}
          prevAriaLabel={prevAriaLabel}
          nextAriaLabel={nextAriaLabel}
        />
      </div>
    </section>
  );
}
