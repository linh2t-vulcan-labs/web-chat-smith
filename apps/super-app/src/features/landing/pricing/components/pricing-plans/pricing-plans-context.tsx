"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

import type { ProductModel } from "@/core/models/product";

import { usePricingAuth } from "../../hooks/use-pricing-auth";
import { usePricingProducts } from "../../hooks/use-pricing-products";
import type { PricingCtaVariant } from "../../utils/pricing-cta";

function resolveSelectedPlanId(
  products: ProductModel[],
  activeProductId: string | undefined,
  selectedId: string
): string {
  if (!products.length) {
    return "";
  }

  if (
    activeProductId &&
    products.some((product) => product.id === activeProductId)
  ) {
    return activeProductId;
  }

  if (selectedId && products.some((product) => product.id === selectedId)) {
    return selectedId;
  }

  return products[0]?.id ?? "";
}

interface PricingPlansContextValue {
  locale: string;
  isLoggedIn: boolean;
  loginLinkHref: string;
  loginNavigateHref: string;
  manageLinkHref: string;
  manageNavigateHref: string;
  manageCtaVariant: PricingCtaVariant;
  activeProductId: string | undefined;
  products: ProductModel[];
  isLoading: boolean;
  selectedId: string;
  selectedProduct: ProductModel | undefined;
  selectPlan: (productId: string) => void;
}

const PricingPlansContext = createContext<PricingPlansContextValue | null>(
  null
);

export function PricingPlansProvider({ children }: { children: ReactNode }) {
  const {
    isAuthLoading,
    locale,
    isLoggedIn,
    loginLinkHref,
    loginNavigateHref,
    manageLinkHref,
    manageNavigateHref,
    manageCtaVariant,
    activeProductId,
    subscription,
  } = usePricingAuth();
  const { products, isLoading: isProductsLoading } = usePricingProducts({
    activeProductId,
    enabled: !isAuthLoading,
    subscription,
  });
  const isLoading = isAuthLoading || isProductsLoading;
  const [selectedId, setSelectedId] = useState("");

  const resolvedSelectedId = useMemo(
    () => resolveSelectedPlanId(products, activeProductId, selectedId),
    [products, activeProductId, selectedId]
  );

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === resolvedSelectedId),
    [products, resolvedSelectedId]
  );

  const value = useMemo<PricingPlansContextValue>(
    () => ({
      activeProductId,
      isLoading,
      isLoggedIn,
      locale,
      loginLinkHref,
      loginNavigateHref,
      manageCtaVariant,
      manageLinkHref,
      manageNavigateHref,
      products,
      selectPlan: setSelectedId,
      selectedId: resolvedSelectedId,
      selectedProduct,
    }),
    [
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
      resolvedSelectedId,
      selectedProduct,
    ]
  );

  return <PricingPlansContext value={value}>{children}</PricingPlansContext>;
}

export function usePricingPlansContext() {
  const context = useContext(PricingPlansContext);
  if (!context) {
    throw new Error(
      "usePricingPlansContext must be used within PricingPlansProvider"
    );
  }
  return context;
}
