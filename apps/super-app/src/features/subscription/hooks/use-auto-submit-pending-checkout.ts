import { useEffect, useRef } from "react";

import type { ProductModel } from "@/core/models/product";
import { useGlobalState } from "@/store/global/hooks";

interface TUseAutoSubmitPendingCheckoutProps {
  products: ProductModel[];
  selectedProduct: ProductModel | null | undefined;
  applySelectedProduct: (product: ProductModel) => void;
  onSubmit?: (product: ProductModel) => void;
  onProductApplied?: (product: ProductModel) => void;
  enabled?: boolean;
}

export const useAutoSubmitPendingCheckout = ({
  products,
  selectedProduct,
  applySelectedProduct,
  onSubmit,
  onProductApplied,
  enabled = true,
}: TUseAutoSubmitPendingCheckoutProps) => {
  const userId = useGlobalState((state) => state.user?.id);
  const selectedProductForCheckout = useGlobalState(
    (state) => state.selectedProductForCheckout
  );
  const setSelectedProductForCheckout = useGlobalState(
    (state) => state.setSelectedProductForCheckout
  );

  // Stable refs: always point to the latest callbacks without being effect deps.
  // Consumers never need useCallback.
  const applyRef = useRef(applySelectedProduct);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-callback ref updated during render so effects below always call the newest callback without adding it as a dep
  applyRef.current = applySelectedProduct;

  const onSubmitRef = useRef(onSubmit);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-callback ref updated during render so effects below always call the newest callback without adding it as a dep
  onSubmitRef.current = onSubmit;

  const onProductAppliedRef = useRef(onProductApplied);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-callback ref updated during render so effects below always call the newest callback without adding it as a dep
  onProductAppliedRef.current = onProductApplied;

  // Tracks the product Phase 1 resolved, decoupled from selectedProduct state.
  // PricingRadioGroupV2 auto-selects firstProduct on mount (parent effect runs before
  // child effect, so its setSelectedProduct call lands last and overwrites ours).
  // Storing the intent in a ref lets Phase 2 submit the correct product regardless.
  const pendingSubmitRef = useRef<ProductModel | null>(null);

  // Phase 1: match pending product and apply it to local UI state
  useEffect(() => {
    if (!enabled || !userId || !selectedProductForCheckout) {
      return;
    }

    const pendingProduct = products.find(
      (p) => p.id === selectedProductForCheckout.id
    );
    if (!pendingProduct) {
      return;
    }

    if (pendingSubmitRef.current?.id === pendingProduct.id) {
      return;
    }

    if (selectedProduct) {
      if (selectedProduct.id !== pendingProduct.id) {
        return;
      }
      pendingSubmitRef.current = pendingProduct;
      onProductAppliedRef.current?.(pendingProduct);
      return;
    }

    pendingSubmitRef.current = pendingProduct;
    applyRef.current(pendingProduct);
    onProductAppliedRef.current?.(pendingProduct);
  }, [enabled, userId, products, selectedProduct, selectedProductForCheckout]);

  // Phase 2: fire checkout once the UI has a selected product (non-null selectedProduct
  // means the DS detail view / billing screen is rendered and the Paddle container exists).
  // Uses pendingSubmitRef instead of comparing IDs so PricingRadioGroupV2's auto-select
  // cannot prevent checkout from firing.
  useEffect(() => {
    if (
      !enabled ||
      !userId ||
      !selectedProduct ||
      !pendingSubmitRef.current ||
      !products?.length
    ) {
      return;
    }

    const productToSubmit = pendingSubmitRef.current;
    pendingSubmitRef.current = null;
    onSubmitRef.current?.(productToSubmit);
    setSelectedProductForCheckout(null); // clear intent so this never fires twice
  }, [
    enabled,
    userId,
    products,
    selectedProduct,
    setSelectedProductForCheckout,
  ]);
};
