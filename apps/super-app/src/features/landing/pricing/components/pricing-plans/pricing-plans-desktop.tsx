"use client";

import { useTranslations } from "next-intl";
import { memo, useCallback } from "react";
import type { MouseEvent, ReactNode } from "react";

import type { ProductModel } from "@/core/models/product";
import { Link } from "@/i18n/navigation";

import { useFeaturePageTracking } from "../../../ai-tool/tracking/use-feature-page-tracking";
import { getPlanSaveBadgeLabel } from "../../utils/plan-save-badge";
import { assignPricingLocationHref } from "../../utils/pricing-cta";
import {
  PRICING_OUTLINED_ICONS,
  PRICING_PAYMENT_ICONS,
} from "../pricing-content/pricing-benefits";
import { usePricingPlansContext } from "./pricing-plans-context";
import PricingPriceCardsSkeleton from "./pricing-price-cards-skeleton";

import styles from "../pricing-content/styles.module.css";

const ClockIcon = PRICING_OUTLINED_ICONS.clock;
const ArrowRightIcon = PRICING_OUTLINED_ICONS.arrowRight;
const ProtectIcon = PRICING_OUTLINED_ICONS.protect;

interface PricingCtaLinkProps {
  linkHref: string;
  navigateHref: string;
  locale: string;
  label: string;
  isDisabled: boolean;
}

function PricingCtaLink({
  linkHref,
  navigateHref,
  locale,
  label,
  isDisabled,
}: PricingCtaLinkProps) {
  const { trackPricingPackageSelected } = useFeaturePageTracking();

  const handleClick = useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }

      event.preventDefault();
      trackPricingPackageSelected();
      assignPricingLocationHref(navigateHref);
    },
    [isDisabled, navigateHref, trackPricingPackageSelected]
  );

  return (
    <Link
      href={linkHref}
      locale={locale}
      className={styles.ctaPrimary}
      tabIndex={isDisabled ? -1 : undefined}
      aria-disabled={isDisabled}
      onClick={handleClick}
    >
      <span className={styles.ctaPrimaryLabel}>{label}</span>
      <ArrowRightIcon className={styles.ctaArrow} aria-hidden />
    </Link>
  );
}

interface PricingPriceCardProps {
  product: ProductModel;
  isSelected: boolean;
  isCurrentPlan: boolean;
  onSelect: (productId: string) => void;
}

const PricingPriceCard = memo(
  ({ product, isSelected, isCurrentPlan, onSelect }: PricingPriceCardProps) => {
    const commonT = useTranslations("common");
    const dsT = useTranslations("ds");
    const saveLabel = getPlanSaveBadgeLabel(product, dsT);

    return (
      <label
        className={styles.priceCard}
        data-current-plan={isCurrentPlan ? true : undefined}
        aria-label={`${commonT("amountPerDuration", {
          amount: product.numberOfMonths,
          duration: commonT("duration.month"),
        })} ${product.sellingPrice}`}
      >
        <input
          type="radio"
          name="pricing-plan"
          className={styles.planOptionInput}
          value={product.id}
          checked={isSelected}
          onChange={() => onSelect(product.id)}
        />
        <span className={styles.priceCardInner}>
          <span className={styles.priceCardRadio} aria-hidden />
          <span className={styles.priceCardPackage}>
            <span className={styles.priceCardPlanSide}>
              <span className={styles.priceCardPlanRow}>
                <span className={styles.priceCardDuration}>
                  {commonT("amountPerDuration", {
                    amount: product.numberOfMonths,
                    duration: commonT(`duration.month`),
                  })}
                  {isCurrentPlan ? ` (${commonT("currentPlan")})` : ""}
                </span>
                {saveLabel ? (
                  <span className={styles.priceCardSave}>{saveLabel}</span>
                ) : null}
              </span>
            </span>
            <span className={styles.priceCardPriceSide}>
              <span className={styles.priceCardMainPrices}>
                {product.originalPrice ? (
                  <span className={styles.priceStrike}>
                    {product.originalPrice}
                  </span>
                ) : null}
                <span className={styles.priceSelling}>
                  {product.sellingPrice}
                </span>
              </span>
              <span className={styles.pricePerWeek}>
                <span className={styles.pricePerWeekAmount}>
                  {product.pricePerWeek}
                </span>
                <span className={styles.pricePerWeekLabel}>
                  {commonT("perDuration", {
                    duration: commonT("duration.week"),
                  })}
                </span>
              </span>
            </span>
          </span>
        </span>
      </label>
    );
  }
);
PricingPriceCard.displayName = "PricingPriceCard";

interface PricingPlansDesktopProps {
  policySlot: ReactNode;
}

export default function PricingPlansDesktop({
  policySlot,
}: PricingPlansDesktopProps) {
  const t = useTranslations("pricing");
  const {
    locale,
    isLoggedIn,
    loginLinkHref,
    loginNavigateHref,
    manageLinkHref,
    manageNavigateHref,
    manageCtaVariant,
    activeProductId,
    products,
    isLoading,
    selectedId,
    selectPlan,
  } = usePricingPlansContext();

  const showPriceCards = !isLoading && products.length > 0;
  const isCtaDisabled = isLoading || !showPriceCards;

  return (
    <article className={styles.plansCard} aria-busy={isLoading}>
      <div className={styles.plansInner}>
        <h2 className={styles.plansHeroTitle}>
          <span className={styles.plansHeroLine}>{t("plansHero.prefix")}</span>
          <span className={styles.plansHeroLine}>
            <span className={styles.titleHighlight}>
              {t("plansHero.highlight")}
            </span>
          </span>
        </h2>

        <div className={styles.priceCardsSlot}>
          <div
            className={`${styles.priceCardsLayer} ${styles.priceCardsSkeletonLayer} ${showPriceCards ? styles.priceCardsLayerHidden : ""}`}
            aria-hidden={showPriceCards}
          >
            <PricingPriceCardsSkeleton />
          </div>

          <div
            className={`${styles.priceCardsLayer} ${styles.priceCardsContentLayer} ${showPriceCards ? "" : styles.priceCardsLayerHidden}`}
            role="radiogroup"
            aria-label={t("checkout.aria")}
            aria-hidden={!showPriceCards}
          >
            <div className={styles.priceCards}>
              {products.map((product) => (
                <PricingPriceCard
                  key={product.id}
                  product={product}
                  isSelected={product.id === selectedId}
                  isCurrentPlan={Boolean(
                    activeProductId && product.id === activeProductId
                  )}
                  onSelect={selectPlan}
                />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.paymentMethods}>
          <p className={styles.paymentMethodsLabel}>
            {t("checkout.paymentMethods")}
          </p>
          <ul
            className={styles.paymentMethodsList}
            aria-label={t("checkout.paymentMethods")}
          >
            {PRICING_PAYMENT_ICONS.map(({ id, Icon }) => (
              <li key={id} className={styles.paymentMethodsItem}>
                <Icon className={styles.paymentMethodsIcon} aria-hidden />
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.plansCtaBlock}>
          <p className={styles.cancelAnytime}>
            <ClockIcon
              className={styles.cancelAnytimeIcon}
              width={16}
              height={16}
              aria-hidden
            />
            {t("checkout.cancelAnytime")}
          </p>
          {isLoggedIn ? (
            <PricingCtaLink
              linkHref={manageLinkHref}
              navigateHref={manageNavigateHref}
              locale={locale}
              label={t(`cta.${manageCtaVariant}`)}
              isDisabled={isCtaDisabled}
            />
          ) : (
            <PricingCtaLink
              linkHref={loginLinkHref}
              navigateHref={loginNavigateHref}
              locale={locale}
              label={t("cta.guest")}
              isDisabled={isCtaDisabled}
            />
          )}
        </div>

        <div className={styles.checkoutFooter}>
          <p className={styles.checkoutSecure}>
            <ProtectIcon
              className={styles.checkoutSecureIcon}
              width={20}
              height={20}
              aria-hidden
            />
            {t("checkout.paySafe")}
          </p>
          <div className={styles.checkoutPolicyText}>{policySlot}</div>
        </div>
      </div>
    </article>
  );
}
