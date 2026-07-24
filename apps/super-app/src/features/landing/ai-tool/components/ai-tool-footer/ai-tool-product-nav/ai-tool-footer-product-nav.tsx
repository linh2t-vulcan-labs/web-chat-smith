import Link from "next/link";

import type { AiToolTitleByLocale } from "@/libs/sanity/sanity.types";

import type { HeaderCategories } from "../../../sanity/get-header-categories";
import { AI_TOOL_LOCALES } from "../../../translations/config";
import type { AIToolLocale } from "../../../translations/config";
import { getAIToolTranslation } from "../../../translations/translattion";
import type {
  AIToolHeaderCategoryLinkRow,
  AIToolHeaderCategoryRow,
} from "../../../types/types";
import { pickByLocaleKey } from "../../../utils/locale-record";

import styles from "./styles.module.css";

function pickLocalizedTitle(
  byLocale: AiToolTitleByLocale | undefined,
  locale: AIToolLocale
): string {
  if (!byLocale) {
    return "";
  }
  const preferred = pickByLocaleKey(byLocale, locale);
  if (typeof preferred === "string" && preferred.trim()) {
    return preferred.trim();
  }
  for (const loc of AI_TOOL_LOCALES) {
    const v = pickByLocaleKey(byLocale, loc);
    if (typeof v === "string" && v.trim()) {
      return v.trim();
    }
  }
  return "";
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//iu.test(href.trim());
}

function externalLinkProps(href: string): { target?: "_blank"; rel?: string } {
  return isExternalHref(href)
    ? { rel: "noopener noreferrer", target: "_blank" }
    : {};
}

function CategoryColumnList({
  rows,
  locale,
  untitledLabel,
  variant = "product",
}: {
  rows: AIToolHeaderCategoryRow[];
  locale: AIToolLocale;
  untitledLabel: string;
  variant?: "product" | "extra";
}) {
  const filtered = rows.filter((row) => row.category?._id);
  if (!filtered.length) {
    return null;
  }

  return (
    <>
      {filtered.map(({ _key: rowKey, category }) => (
        <div
          key={`${category._id}-${rowKey}`}
          className={`${styles.categoryBlock} ${
            variant === "extra"
              ? styles.categoryBlockExtra
              : styles.categoryBlockProduct
          }`}
        >
          <h4 className={styles.categoryTitle}>
            {pickLocalizedTitle(category.categoryTitleByLocale, locale) ||
              untitledLabel}
          </h4>
          <ul className={styles.linkList}>
            {(category.links ?? [])
              .filter((item): item is AIToolHeaderCategoryLinkRow =>
                Boolean(item.link?._id)
              )
              .map((item) => {
                const href = item.link.url?.trim() || "#";
                return (
                  <li key={item._key}>
                    <Link
                      href={href as never}
                      className={styles.link}
                      {...externalLinkProps(href)}
                    >
                      {pickLocalizedTitle(
                        item.link.linkTitleByLocale,
                        locale
                      ) || untitledLabel}
                    </Link>
                  </li>
                );
              })}
          </ul>
        </div>
      ))}
    </>
  );
}

export interface AIToolFooterProductNavProps {
  locale: AIToolLocale;
  categories: HeaderCategories["categories"];
  extraCategories: HeaderCategories["extraCategories"];
}

export interface AIToolFooterProductNavLabels {
  untitledLabel: string;
  productNavAria: string;
  featureColumnTitle: string;
}

/**
 * Desktop-only footer strip: primary `categories` under a “Feature” label,
 * `extra_categories` on the right with a hidden section label spacer for column alignment.
 */
export function AIToolFooterProductNavContent({
  locale,
  categories,
  extraCategories,
  untitledLabel,
  productNavAria,
  featureColumnTitle,
}: AIToolFooterProductNavProps & AIToolFooterProductNavLabels) {
  const productRows = categories;
  const extraRows = extraCategories;

  const hasProduct = productRows.some((row) => row.category?._id);
  const hasExtra = extraRows.some((row) => row.category?._id);
  if (!hasProduct && !hasExtra) {
    return null;
  }

  return (
    <section
      className={styles.root}
      aria-label={productNavAria}
      data-ai-footer-product-nav
    >
      <div className={styles.grid}>
        {hasProduct ? (
          <h3 className={styles.sectionLabel}>{featureColumnTitle}</h3>
        ) : null}
        <div className={styles.columnsRow}>
          {hasProduct ? (
            <div className={styles.productArea}>
              <CategoryColumnList
                rows={productRows}
                locale={locale}
                untitledLabel={untitledLabel}
                variant="product"
              />
            </div>
          ) : null}
          {hasExtra ? (
            <aside className={styles.extraStack}>
              <CategoryColumnList
                rows={extraRows}
                locale={locale}
                untitledLabel={untitledLabel}
                variant="extra"
              />
            </aside>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default async function AIToolFooterProductNav({
  locale,
  categories,
  extraCategories,
}: AIToolFooterProductNavProps) {
  const { t } = await getAIToolTranslation(locale);

  return (
    <AIToolFooterProductNavContent
      locale={locale}
      categories={categories}
      extraCategories={extraCategories}
      untitledLabel={t("header.fallback.untitled")}
      productNavAria={t("footer.productNavAria")}
      featureColumnTitle={t("footer.featureColumnTitle")}
    />
  );
}
