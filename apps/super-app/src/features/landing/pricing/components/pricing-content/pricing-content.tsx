import type { Route } from "next";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import type { ReactNode } from "react";

import { normalizeAIToolLocale } from "@/features/landing/ai-tool/translations/config";
import { buildLocalizedPublicHref } from "@/features/landing/ai-tool/utils";
import {
  PRIVACY_POLICY_URL,
  REFUND_POLICY_URL,
  TERMS_OF_USE_URL,
} from "@/utils/constants/url";

import { buildPricingHomeHref } from "../../utils/home-href";
import { PricingPlansDesktop, PricingPlansProvider } from "../pricing-plans";
import PricingBenefitRow from "./pricing-benefit-row";
import {
  PRICING_AI_MODELS,
  PRICING_BENEFIT_ROWS,
  PRICING_NAV_ICONS,
} from "./pricing-benefits";

import styles from "./styles.module.css";

const BreadcrumbArrowIcon = PRICING_NAV_ICONS.breadcrumbArrow;

export interface PricingContentProps {
  locale: string;
}

function renderPolicyBreakMobile(): ReactNode {
  return <br className={styles.policyBreak} />;
}

function makePolicyLinkRenderer(lang: string, url: string) {
  return (chunks: ReactNode): ReactNode => (
    <Link
      href={buildLocalizedPublicHref(lang, url) as Route}
      className={styles.policyLink}
    >
      {chunks}
    </Link>
  );
}

/**
 * Pricing page UI only (no products / checkout). Figma:
 * - Breadcrumb: 221:14055
 * - Desktop: 262:49651
 * - Mobile: 224:21797, 249:40576, 249:40662
 */
export default async function PricingContent({ locale }: PricingContentProps) {
  const lang = normalizeAIToolLocale(locale);
  const [t, dsT] = await Promise.all([
    getTranslations({ locale: lang, namespace: "pricing" }),
    getTranslations("ds"),
  ]);
  const homeHref = buildPricingHomeHref(lang);

  const policyT = dsT.rich("policy", {
    breakMobile: renderPolicyBreakMobile,
    privacy: makePolicyLinkRenderer(lang, PRIVACY_POLICY_URL),
    refund: makePolicyLinkRenderer(lang, REFUND_POLICY_URL),
    terms: makePolicyLinkRenderer(lang, TERMS_OF_USE_URL),
  });

  return (
    <main className={styles.main} aria-label={t("aria.section")}>
      <div className={styles.inner}>
        <nav className={styles.breadcrumb} aria-label={t("aria.breadcrumb")}>
          <Link className={styles.crumb} href={homeHref as Route}>
            {t("breadcrumb.home")}
          </Link>
          <BreadcrumbArrowIcon className={styles.crumbSepIcon} aria-hidden />
          <span className={styles.crumbCurrent}>{t("breadcrumb.current")}</span>
        </nav>

        <section
          className={styles.pricingSection}
          aria-label={t("aria.section")}
        >
          <header className={styles.pageHero}>
            <h1 className={styles.pageTitle}>
              <span className={styles.titleHighlight}>
                {t("hero.titleHighlight")}
              </span>
              {t("hero.titleRest")}
            </h1>
            <p className={styles.pageSubtitle}>{t("hero.subtitle")}</p>
          </header>

          <div className={styles.packsRow}>
            <article className={styles.comparisonsCard}>
              <div className={styles.builtOnBlock}>
                <p className={styles.builtOnLabel}>{dsT("builtOn")}</p>
                <ul className={styles.builtOnModels}>
                  {PRICING_AI_MODELS.map((model) => {
                    const ModelIcon = model.Icon;
                    return (
                      <li key={model.name} className={styles.builtOnModel}>
                        <span className={styles.builtOnModelIcon}>
                          <ModelIcon
                            className={styles.builtOnModelLogo}
                            aria-hidden
                          />
                        </span>
                        <span className={styles.builtOnModelName}>
                          {model.name}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className={styles.benefitsTable}>
                <div className={styles.benefitsTableHead}>
                  <span className={styles.benefitsSectionTitle}>
                    {t("benefits.sectionTitle")}
                  </span>
                  <div className={styles.benefitsColLabels}>
                    <span className={styles.benefitsColFree}>
                      {t("benefits.free")}
                    </span>
                    <span className={styles.benefitsColPro}>
                      {t("benefits.pro")}
                    </span>
                  </div>
                </div>

                <ul className={styles.benefitsRows}>
                  {PRICING_BENEFIT_ROWS.map((row) => (
                    <PricingBenefitRow
                      key={row.id}
                      row={row}
                      title={t(row.titleKey)}
                      description={t(row.descriptionKey)}
                      limitedLabel={t("benefits.limited")}
                    />
                  ))}
                </ul>
              </div>
            </article>

            <PricingPlansProvider>
              <PricingPlansDesktop policySlot={policyT} />
            </PricingPlansProvider>
          </div>
        </section>
      </div>
    </main>
  );
}
