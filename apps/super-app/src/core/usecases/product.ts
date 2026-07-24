import {
  EDURATION_UNIT,
  EPRODUCT_STATUS,
  ESUBSCRIPTION_STATUS,
} from "@/utils/commons/enums";

import type { ProductModel } from "../models/product";
import type { TProductRepository } from "../ports/product";

// Duration unit priority mapping for sorting
// Priority: YEAR(5) > QUARTERLY(4) > MONTH(3) > WEEK(2) > DAY(1)
const DURATION_LEVEL_SORT: Record<EDURATION_UNIT, number> = {
  [EDURATION_UNIT.YEAR]: 5,
  [EDURATION_UNIT.QUARTERLY]: 4,
  [EDURATION_UNIT.MONTH]: 3,
  [EDURATION_UNIT.WEEK]: 2,
  [EDURATION_UNIT.DAY]: 1,
};

/**
 * Sorts products by duration unit level.
 * If current level is DAY (1), sorts ascending (for downgrades).
 * Otherwise, sorts descending (for upgrades).
 */
const sortProductsByDurationLevel = (
  products: ProductModel[],
  currentLevel: number
): ProductModel[] =>
  [...products].toSorted((a, b) => {
    const aLevel = DURATION_LEVEL_SORT[a.durationUnit];
    const bLevel = DURATION_LEVEL_SORT[b.durationUnit];

    const ascendingOrder = aLevel - bLevel;
    const descendingOrder = bLevel - aLevel;

    return currentLevel === 1 ? ascendingOrder : descendingOrder;
  });

/**
 * Filters and sorts products excluding the active subscription package.
 */
const filterAndSortRemainingProducts = (
  products: ProductModel[],
  activeSubscriptionPackage: ProductModel
): ProductModel[] => {
  const currentLevel =
    DURATION_LEVEL_SORT[activeSubscriptionPackage.durationUnit];

  const remainingProducts = products.filter(
    (p) =>
      p.id !== activeSubscriptionPackage.id &&
      activeSubscriptionPackage.status !== EPRODUCT_STATUS.INACTIVE
  );

  return sortProductsByDurationLevel(remainingProducts, currentLevel);
};

const getActiveSubscriptions: TProductRepository["getActiveSubscriptions"] = (
  products,
  useMonthlyTrial = false
) => {
  if (useMonthlyTrial) {
    return products.filter((p) => {
      const isYearly = p.id.includes("yearly") && !p.id.includes("trial");
      const isMonthlyTrial = p.id.includes("monthlytrial");
      return isYearly || isMonthlyTrial;
    });
  }
  return products.filter((p) => !p.isTrial);
};

const getActiveSubscriptionPackage: TProductRepository["getActiveSubscriptionPackage"] =
  (userSubscriptionInfo, products) => {
    const { isValidPremiumUser, currentSubscriptionInfo } =
      userSubscriptionInfo;

    const allowToActiveStatus = new Set([
      ESUBSCRIPTION_STATUS.TRIAL,
      ESUBSCRIPTION_STATUS.ACTIVE,
      ESUBSCRIPTION_STATUS.GRACE_PERIOD,
    ]);

    if (!isValidPremiumUser) {
      return;
    }

    const currentPlan = products.find(
      (p) =>
        p.id === currentSubscriptionInfo?.metadata?.subscriptionId &&
        (allowToActiveStatus.has(currentSubscriptionInfo.status) ||
          (currentSubscriptionInfo.status === ESUBSCRIPTION_STATUS.CANCELLED &&
            isValidPremiumUser))
    );

    return currentPlan;
  };

/**
 * Orders subscription products so the customer's active package is first,
 * followed by the remaining options sorted by priority for upgrade/downgrade flows.
 *
 * Priority (highest → lowest unless current level is daily, which inverts for downgrades):
 * YEAR(5) > QUARTERLY(4) > MONTH(3) > WEEK(2) > DAY(1)
 */
const sortedProductAfterMappingSubscription: TProductRepository["sortedProductAfterMappingSubscription"] =
  (userSubscriptionInfo, products, useMonthlyTrial = false) => {
    const { currentSubscriptionInfo } = userSubscriptionInfo;
    const activeSubscriptionPackage = getActiveSubscriptionPackage(
      userSubscriptionInfo,
      products
    );

    if (!currentSubscriptionInfo || !activeSubscriptionPackage) {
      return getActiveSubscriptions(products, useMonthlyTrial);
    }

    const sorted = filterAndSortRemainingProducts(
      products,
      activeSubscriptionPackage
    );
    return [activeSubscriptionPackage, ...sorted];
  };

/**
 * Orders subscription products by active subscription ID.
 * The active package is placed first, followed by remaining options sorted by priority.
 *
 * Priority (highest → lowest unless current level is daily, which inverts for downgrades):
 * YEAR(5) > QUARTERLY(4) > MONTH(3) > WEEK(2) > DAY(1)
 */
const sortedProductAfterMappingActiveSubscription: TProductRepository["sortedProductAfterMappingActiveSubscription"] =
  (activeSubscriptionId, products, useMonthlyTrial = false) => {
    const filteredProducts = getActiveSubscriptions(products, useMonthlyTrial);

    const activeSubscriptionPackage = filteredProducts.find(
      (p) => p.id === activeSubscriptionId
    );

    if (!activeSubscriptionPackage) {
      return filteredProducts;
    }

    const sorted = filterAndSortRemainingProducts(
      filteredProducts,
      activeSubscriptionPackage
    );
    return [activeSubscriptionPackage, ...sorted];
  };

const getBestSubscriptionPackage: TProductRepository["getBestSubscriptionPackage"] =
  (products) => {
    const sorted = [...products]
      .filter((p) => p.status !== EPRODUCT_STATUS.INACTIVE && !p.isTrial)
      .toSorted((a, b) => {
        const aLevel = a.pricePerWeekNumeric as number;
        const bLevel = b.pricePerWeekNumeric as number;

        const ascendingOrder = aLevel - bLevel;

        return ascendingOrder;
      });

    return sorted[0];
  };

export const productUseCases = (): TProductRepository => ({
  getActiveSubscriptionPackage,
  getActiveSubscriptions,
  getBestSubscriptionPackage,
  sortedProductAfterMappingActiveSubscription,
  sortedProductAfterMappingSubscription,
});
