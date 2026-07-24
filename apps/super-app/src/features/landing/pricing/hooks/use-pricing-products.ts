"use client";

import { useMemo } from "react";

import { SUBSCRIPTION_API_VERSION } from "@/config/subscription";
import type { ProductModel } from "@/core/models/product";
import type { SubscriptionModel } from "@/core/models/subscription";
import { productClientService } from "@/core/repositories";
import { productUseCases } from "@/core/usecases/product";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { useQuery } from "@/libs/react-query";
import { EDURATION_UNIT } from "@/utils/commons/enums";

const PRICING_DURATION_ORDER: Partial<Record<EDURATION_UNIT, number>> = {
  [EDURATION_UNIT.MONTH]: 1,
  [EDURATION_UNIT.YEAR]: 2,
};

function filterPricingPlanProducts(products: ProductModel[]): ProductModel[] {
  return products
    .filter(
      (product) =>
        product.durationUnit === EDURATION_UNIT.MONTH ||
        product.durationUnit === EDURATION_UNIT.YEAR
    )
    .toSorted(
      (a, b) =>
        (PRICING_DURATION_ORDER[a.durationUnit] ?? 99) -
        (PRICING_DURATION_ORDER[b.durationUnit] ?? 99)
    );
}

interface UsePricingProductsOptions {
  enabled?: boolean;
  activeProductId?: string;
  subscription?: SubscriptionModel;
}

/**
 * Loads plan options for the pricing page (same pipeline as PricingRadioGroup / update-plan step).
 */
export function usePricingProducts({
  enabled = true,
  activeProductId,
  subscription,
}: UsePricingProductsOptions = {}) {
  const { getValueSyncRemoteConfig, isReady } = useRemoteConfigContext();

  const apiVersion = isReady
    ? getValueSyncRemoteConfig(REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_INFO)
    : undefined;

  const newPricing = apiVersion === SUBSCRIPTION_API_VERSION.V2;

  const {
    data: productResponse,
    isLoading,
    isError,
  } = useQuery({
    enabled: enabled && isReady,
    queryFn: () => {
      const version = apiVersion || "v1";
      return productClientService.getProductsByAppId(version);
    },
    queryKey: ["pricing-products", apiVersion],
  });

  const products = useMemo(() => {
    const [, rawProducts] = productResponse ?? [];
    if (!rawProducts?.length) {
      return [];
    }

    const activeProducts = productUseCases().getActiveSubscriptions(
      rawProducts,
      false
    );

    if (activeProductId) {
      return filterPricingPlanProducts(
        productUseCases().sortedProductAfterMappingActiveSubscription(
          activeProductId,
          activeProducts,
          false
        )
      );
    }

    if (subscription?.isValidPremiumUser) {
      return filterPricingPlanProducts(
        productUseCases().sortedProductAfterMappingSubscription(
          subscription,
          activeProducts,
          false
        )
      );
    }

    return filterPricingPlanProducts(activeProducts);
  }, [productResponse, activeProductId, subscription]);

  return {
    isError,
    isLoading: !enabled || !isReady || isLoading,
    newPricing,
    products,
  };
}
