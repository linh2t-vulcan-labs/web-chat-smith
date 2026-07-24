"use client";

import { useLocale } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import type { TExpressCheckoutState } from "@/components/account-subscription-modal-v4/paddle-express-checkout-button";
import type { ProductModel } from "@/core/models/product";
import { useCheckoutCustomer } from "@/hooks/payments/use-checkout-customer";
import useDebouncedCallback from "@/hooks/use-debounced-callback";
import type { withInlineSettings } from "@/libs/paddle-js";
import {
  getErrorDetails,
  getTransactionId,
  isCheckoutReady,
} from "@/libs/paddle-js";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import { localStorageImpl } from "@/utils/commons/helpers";
import {
  ENABLE_PREMIUM_ONBOARDING_MODAL_KEY,
  HAS_SEEN_PREMIUM_ONBOARDING_MODAL_KEY,
} from "@/utils/commons/keys";

import { useCheckoutOpener } from "./use-checkout-opener";
import type { PaddleFlow } from "./use-paddle-checkout";
import { usePaddleCheckout } from "./use-paddle-checkout";
import { usePollingUserSubscriptions } from "./use-polling-get-user-subscriptions";

type TInlineOpts = Parameters<typeof withInlineSettings>[2];

// Collapse rapid plan switches into a single updateItems + order-sync call. Paddle fires a
// `transaction.updated` webhook per updateItems, so debouncing also throttles the BE event stream.
const ORDER_SYNC_DEBOUNCE_MS = 400;

export interface TMobileV2CheckoutConfig {
  flow: PaddleFlow;
  container: string;
  paddleOpts: TInlineOpts;
}

/**
 * Payment Flow V2 inline **express** checkout core for mobile (Apple Pay).
 *
 * V2-only: opens Paddle directly with `priceId` + `custom_data.internal_customer_id` through the
 * centralized {@link useCheckoutOpener}. Uses the **open-once + updateItems** pattern — the iframe
 * (and the Apple Pay sheet) opens once, then plan switches swap line items in place instead of
 * close→reopen, so there is no flicker and the Apple Pay button never disappears.
 */
export function useMobileV2Checkout(
  product: ProductModel | undefined,
  config: TMobileV2CheckoutConfig
) {
  const [checkoutState, setCheckoutState] =
    useState<TExpressCheckoutState>("idle");
  // True from the moment a plan switch is selected until the debounced updateItems has actually
  // run, so the pay button stays blocked while the iframe still reflects the previous plan.
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const locale = useLocale();

  const {
    ready: paddleReady,
    setFlowHandlers,
    clearFlowHandlers,
    closeCheckout,
  } = usePaddleCheckout();
  const { openForProduct, updateForProduct } = useCheckoutOpener();
  const { customer: checkoutCustomer, isCountryResolved } =
    useCheckoutCustomer();

  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );
  const userId = useGlobalState((state) => state.user.id);
  const purchaseSource = useGlobalState((state) => state.purchaseSource);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const { startPolling } = usePollingUserSubscriptions();

  // Tracks whether we've already opened the iframe this session, so subsequent plan
  // switches use updateItems instead of reopening.
  const openedRef = useRef(false);
  // Product id the iframe was opened/updated for — lets Effect B skip a redundant
  // same-price updateItems right after the initial open.
  const openedForIdRef = useRef<string | null>(null);

  // Latest product + purchaseSource for the success handler, read via refs so the
  // flow-handlers effect does not re-register on every plan switch.
  const productRef = useRef(product);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-value ref updated during render so the success handler effect can read current product without re-registering
  productRef.current = product;
  const purchaseSourceRef = useRef(purchaseSource);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-value ref updated during render so the success handler effect can read current purchaseSource without re-registering
  purchaseSourceRef.current = purchaseSource;

  const { flow, container, paddleOpts } = config;

  useEffect(() => {
    // `checkout.loaded` can fire while the transaction is still `draft` (totals not finalized).
    // Tapping Apple Pay during `draft` falls through to Paddle's hosted (sandbox) page instead of
    // the inline express sheet, so we only mark the button `ready` once the status reaches `ready`
    // — and drop back to `loading` if a later update (e.g. a plan switch) returns it to `draft`.
    const syncReadiness = (event: Parameters<typeof isCheckoutReady>[0]) =>
      setCheckoutState(isCheckoutReady(event) ? "ready" : "loading");

    setFlowHandlers(flow, {
      onClosed: () => {
        setCheckoutState("idle");
      },
      onError: (event) => {
        const errorDetails = getErrorDetails(event);
        toast.error(
          errorDetails?.message || "Payment failed. Please try again."
        );
        setCheckoutState("error");
      },
      onLoaded: syncReadiness,
      onSuccess: (event) => {
        const transactionId = getTransactionId(event);
        const purchasedProduct = productRef.current;
        // Mirror the desktop (master) DSPurchaseSuccess payload so analytics/revenue
        // attribution is identical across flows.
        sendTrackingEvent({
          name: EventKeys.DSPurchaseSuccess,
          payload: {
            ecommerce: {
              currency: purchasedProduct?.defaultPrice.currencyIsoFormat ?? "",
              items: purchasedProduct
                ? [
                    {
                      item_id: purchasedProduct.durationUnitLabel,
                      item_name: purchasedProduct.description,
                      price: purchasedProduct.defaultPrice.price,
                      quantity: 1,
                    },
                  ]
                : [],
              transaction_id: transactionId ?? "",
              value: purchasedProduct?.defaultPrice.price ?? 0,
            },
            vulcan_source: purchaseSourceRef.current,
            vulcan_user_id: userId,
          },
        });
        startPolling(
          () => {
            // Mirror the normal (URL-params) flow: once the subscription data has settled,
            // arm the PremiumOnboardingModal so it shows after closing the checkout modal.
            localStorageImpl.save(ENABLE_PREMIUM_ONBOARDING_MODAL_KEY, true);
            localStorageImpl.remove(HAS_SEEN_PREMIUM_ONBOARDING_MODAL_KEY);
            setIsOpenSubscriptionModal(false, undefined);
          },
          () => setIsOpenSubscriptionModal(false, undefined)
        );
      },
      onUpdated: syncReadiness,
    });

    return () => clearFlowHandlers(flow);
  }, [
    flow,
    setFlowHandlers,
    clearFlowHandlers,
    userId,
    sendTrackingEvent,
    startPolling,
    setIsOpenSubscriptionModal,
  ]);

  // Apply a plan switch by swapping the iframe line items. Debounced (below) so rapid toggles
  // collapse into a single updateItems call instead of one per intermediate selection.
  // updateItems is synchronous, so once it returns the live iframe reflects the new plan and the
  // pay button can be unblocked (Paddle's own reload then re-gates briefly via checkoutState).
  const applyProductUpdate = useCallback(
    (nextProduct: ProductModel) => {
      updateForProduct(nextProduct);
      setIsUpdatingPlan(false);
    },
    [updateForProduct]
  );

  const debouncedApplyProductUpdate = useDebouncedCallback(
    applyProductUpdate,
    ORDER_SYNC_DEBOUNCE_MS
  );

  // Effect A — OPEN ONCE when the checkout first becomes usable.
  // Gated on isCountryResolved so express never opens before the geo lookup settles —
  // otherwise the transaction could start in `draft` (and Apple Pay totals would be wrong).
  useEffect(() => {
    if (!product || !paddleReady || !isCountryResolved || openedRef.current) {
      return;
    }
    openedRef.current = true;
    openedForIdRef.current = product.id;
    setCheckoutState("loading");
    const open = async () => {
      try {
        await openForProduct({
          product,
          flow,
          container,
          customer: checkoutCustomer,
          paddleOpts: { ...paddleOpts, locale },
          // NO resolveV1TransactionId — V2-only; the opener always takes the V2 branch here.
        });
      } catch {
        // Fail-closed already toasted + logged in the opener; allow a retry.
        openedRef.current = false;
        openedForIdRef.current = null;
        setCheckoutState("error");
      }
    };
    open();
    // locale intentionally excluded — changing locale mid-flow is not supported.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, paddleReady, isCountryResolved, openForProduct]);

  // Effect B — UPDATE items on every subsequent plan switch (no re-open), debounced.
  useEffect(() => {
    if (!product || !openedRef.current) {
      return;
    }
    // Skip the redundant update for the product the iframe was just opened for.
    if (openedForIdRef.current === product.id) {
      return;
    }
    openedForIdRef.current = product.id;
    // Block the pay button immediately on selection; cleared once the debounced updateItems runs.
    setIsUpdatingPlan(true);
    debouncedApplyProductUpdate(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  // Reset + close when the checkout unmounts (modal close / gating change) so re-entry re-opens.
  useEffect(
    () => () => {
      if (openedRef.current) {
        closeCheckout();
        openedRef.current = false;
        openedForIdRef.current = null;
      }
    },
    [closeCheckout]
  );

  return { checkoutState, isUpdatingPlan };
}
