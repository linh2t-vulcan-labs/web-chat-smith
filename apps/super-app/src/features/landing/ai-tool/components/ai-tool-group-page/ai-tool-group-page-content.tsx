import type { Route } from "next";
import Link from "next/link";

import ArrowRightIcon from "@/public/icons/landing-page/arrow-right.svg?react";
import ArrowUpRightIcon from "@/public/icons/landing-page/arrow-up-right.svg?react";

import type { AiGroupToolCard } from "../../sanity/get-ai-group-tools";
import type { AIToolLocale } from "../../translations/config";
import { getAIToolTranslation } from "../../translations/translattion";

import styles from "./styles.module.css";

export interface AIToolGroupPageContentProps {
  homeHref?: string;
  locale: AIToolLocale;
  /** Breadcrumb current segment — derived from URL group, not CMS title. */
  groupBreadcrumbLabel: string;
  title: string;
  description?: string;
  tools: AiGroupToolCard[];
}

export default async function AIToolGroupPageContent({
  homeHref = "#",
  locale,
  groupBreadcrumbLabel,
  title,
  description,
  tools,
}: AIToolGroupPageContentProps) {
  const { t } = await getAIToolTranslation(locale);
  const breadcrumbAriaLabel = t("banner.aria.breadcrumb");
  const breadcrumbHome = t("banner.breadcrumb.home");
  const toolsAriaLabel = t("groupPage.aria.tools");

  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="ai-tool-group-title">
        <div className={styles.wrap}>
          <nav className={styles.breadcrumb} aria-label={breadcrumbAriaLabel}>
            <Link className={styles.crumb} href={homeHref as Route}>
              {breadcrumbHome}
            </Link>
            <ArrowRightIcon className={styles.crumbSepIcon} aria-hidden />
            <span className={styles.crumbCurrent}>{groupBreadcrumbLabel}</span>
          </nav>

          <div className={styles.heroCopy}>
            <h1 id="ai-tool-group-title" className={styles.title}>
              {title}
            </h1>
            {description ? (
              <p className={styles.description}>{description}</p>
            ) : null}
          </div>
        </div>
      </section>

      {tools.length > 0 ? (
        <section className={styles.toolsSection} aria-label={toolsAriaLabel}>
          <div className={styles.wrap}>
            <ul className={styles.toolGrid}>
              {tools.map((tool) => (
                <li key={tool.id}>
                  <Link className={styles.toolCard} href={tool.href as Route}>
                    <span className={styles.toolCardTitle}>{tool.title}</span>
                    <ArrowUpRightIcon
                      className={styles.toolCardIcon}
                      aria-hidden
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}
