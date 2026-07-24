import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";

import { ECheckoutStep } from "@/components/account-subscription-modal-v4";
import { CheckoutResponseModel } from "@/core/models/order";
import type { ProductModel } from "@/core/models/product";
import { useCheckoutCustomer } from "@/hooks/payments/use-checkout-customer";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import {
  getClientToken,
  getErrorDetails,
  getTransactionId,
} from "@/libs/paddle-js";
import { PADDLE_CONTAINER_CLASSNAME } from "@/libs/paddle-js/constants";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState } from "@/store/global/hooks";
import {
  useSubscriptionActions,
  useSubscriptionLoading,
  useSubscriptionStore,
} from "@/store/subscription";
import { EPAYMENT_METHOD, EPAYMENT_VENDOR } from "@/utils/commons/enums";
import {
  generateUrlWithParams,
  localStorageImpl,
} from "@/utils/commons/helpers";
import {
  ENABLE_PREMIUM_ONBOARDING_MODAL_KEY,
  HAS_SEEN_PREMIUM_ONBOARDING_MODAL_KEY,
} from "@/utils/commons/keys";
import { Logger } from "@/utils/commons/logger";
import type { TPurchaseSource } from "@/utils/commons/types";
import { ORDER_QUERY_PARAMS } from "@/utils/constants/order";

import { useBillingHistoryMutation } from "../orders/use-billing-history";
import { useCreateOrderMutation } from "../orders/use-create-order";
import { useHandleCheckoutMutation } from "../orders/use-handle-checkout";
import { useHandleQuickCheckoutMutation } from "../orders/use-handle-quick-checkout";
import { useGetPaymentInfo } from "../payments/use-get-payment-info";
import { CheckoutError, useCheckoutOpener } from "./use-checkout-opener";
import { usePaddleCheckout } from "./use-paddle-checkout";
import { usePollingUserSubscriptions } from "./use-polling-get-user-subscriptions";

const handleResetPremiumOnboardingKey = () => {
  localStorageImpl.remove(HAS_SEEN_PREMIUM_ONBOARDING_MODAL_KEY);
};

const enablePremiumOnboardingModel = () => {
  localStorageImpl.save(ENABLE_PREMIUM_ONBOARDING_MODAL_KEY, true);
};

// Check if Paddle token is available for lazy loading
const isPaddleAvailable = (): boolean => {
  const token = getClientToken();
  return !!token && token.trim().length > 0;
};

const getOrderCompleteUrl = (
  orderId: string,
  purchaseSource: TPurchaseSource,
  product: ProductModel
) => {
  const {
    id: packageId,
    defaultPrice,
    description,
    durationUnitLabel,
  } = product;
  const { price, currencyIsoFormat } = defaultPrice;

  const successUrl = generateUrlWithParams({
    [ORDER_QUERY_PARAMS.ORDER_COMPLETE]: "true",
    [ORDER_QUERY_PARAMS.PACKAGE_ID]: packageId,
    [ORDER_QUERY_PARAMS.ORDER_ID]: orderId,
    [ORDER_QUERY_PARAMS.PURCHASE_SOURCE]: purchaseSource,
    [ORDER_QUERY_PARAMS.PRICE]: String(price),
    [ORDER_QUERY_PARAMS.CURRENCY]: currencyIsoFormat,
    [ORDER_QUERY_PARAMS.PACKAGE_NAME]: description,
    [ORDER_QUERY_PARAMS.PACKAGE_DURATION_UNIT]: durationUnitLabel,
  });

  const cancelUrl = generateUrlWithParams({
    [ORDER_QUERY_PARAMS.ORDER_COMPLETE]: "false",
    [ORDER_QUERY_PARAMS.PACKAGE_ID]: packageId,
    [ORDER_QUERY_PARAMS.ORDER_ID]: orderId,
    [ORDER_QUERY_PARAMS.PURCHASE_SOURCE]: purchaseSource,
    [ORDER_QUERY_PARAMS.PRICE]: String(price),
    [ORDER_QUERY_PARAMS.CURRENCY]: currencyIsoFormat,
    [ORDER_QUERY_PARAMS.PACKAGE_NAME]: description,
    [ORDER_QUERY_PARAMS.PACKAGE_DURATION_UNIT]: durationUnitLabel,
  });
  return { cancelUrl, successUrl };
};

export const useHandleUserSubscriptions = () => {
  const createOrderMutation = useCreateOrderMutation();
  const handleCheckoutMutation = useHandleCheckoutMutation();
  const handleQuickCheckoutMutation = useHandleQuickCheckoutMutation();
  const billingHistoryMutation = useBillingHistoryMutation();
  const { refetch: refetchPaymentInfo } = useGetPaymentInfo(
    EPAYMENT_VENDOR.STRIPE
  );
  const { sendTrackingEvent } = useSendTrackingEvent();
  const { startPolling } = usePollingUserSubscriptions();
  const [isPending, startTransition] = useTransition();
  const dsT = useTranslations("ds");
  const hasShownPurchaseSuccessToastRef = useRef(false);

  const showPurchaseSuccessToastOnce = useCallback(() => {
    if (hasShownPurchaseSuccessToastRef.current) {
      return;
    }

    hasShownPurchaseSuccessToastRef.current = true;
    toast.success(dsT("purchase.success"));
  }, [dsT]);

  // Subscription store actions and state
  const subscriptionActions = useSubscriptionActions();
  const subscriptionStore = useSubscriptionStore();
  const isLoading = useSubscriptionLoading();

  const setIsOpenSubscriptionModal = useGlobalState(
    (state) => state.setIsOpenSubscriptionModal
  );

  const setCheckoutStep = useGlobalState((state) => state.setCheckoutStep);
  const user = useGlobalState((state) => state.user);
  const paddleCustomerId = useGlobalState((state) => state.paddleCustomerId);
  const userId = user.id;
  const locale = useLocale();

  const { getValueSyncRemoteConfig, isReady: isFirebaseRemoteConfigReady } =
    useRemoteConfigContext();
  const enablePaddleRetain = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.ENABLE_PADDLE_RETAIN
  );
  const isPaddleRetainAvailable =
    isFirebaseRemoteConfigReady && enablePaddleRetain;

  const {
    ready: paddleReady,
    updatePaddle,
    setFlowHandlers,
    clearFlowHandlers,
  } = usePaddleCheckout();
  const { openForProduct, isInFlight } = useCheckoutOpener();
  const { customer: checkoutCustomer } = useCheckoutCustomer();

  useEffect(() => {
    setFlowHandlers("subscriptionCheckout", {
      onClosed: () => {
        subscriptionActions.setIsPaddleCheckoutLoading(false);
        subscriptionActions.setIsProcessingCheckout(false);
        subscriptionActions.setCheckoutContext(null);
      },
      onError: (event) => {
        const context = subscriptionStore.getState().checkoutContext;
        if (!context) {
          return;
        }

        const errorDetails = getErrorDetails(event);

        sendTrackingEvent({
          name: EventKeys.DSPurchaseFailed,
          payload: {
            ecommerce: {
              currency: context.product.defaultPrice.currencyIsoFormat,
              items: [
                {
                  item_id: context.product.durationUnitLabel,
                  item_name: context.product.description,
                  price: context.product.defaultPrice.price,
                  quantity: 1,
                },
              ],
              transaction_id: context.orderId,
              value: context.product.defaultPrice.price,
            },
            vulcan_user_id: userId,
          },
        });

        toast.error(
          errorDetails?.message || "Payment failed. Please try again."
        );
        subscriptionActions.setIsPaddleCheckoutLoading(false);
        subscriptionActions.setIsProcessingCheckout(false);
        subscriptionActions.setCheckoutContext(null);
      },
      onLoaded: () => {
        setCheckoutStep(ECheckoutStep.PAYMENT_CHECKOUT);
        subscriptionActions.setIsPaddleCheckoutLoading(false);
      },
      onPaymentFailed: () => {
        toast.error(
          "Payment was declined. Please check your payment details and try again."
        );
      },
      onSuccess: (event) => {
        const context = subscriptionStore.getState().checkoutContext;
        if (!context) {
          return;
        }

        const transactionId = getTransactionId(event);

        sendTrackingEvent({
          name: EventKeys.DSPurchaseSuccess,
          payload: {
            ecommerce: {
              currency: context.product.defaultPrice.currencyIsoFormat,
              items: [
                {
                  item_id: context.product.durationUnitLabel,
                  item_name: context.product.description,
                  price: context.product.defaultPrice.price,
                  quantity: 1,
                },
              ],
              transaction_id: transactionId || context.orderId,
              value: context.product.defaultPrice.price,
            },
            vulcan_source: context.purchaseSource,
            vulcan_user_id: userId,
          },
        });

        subscriptionActions.setIsPaddleCheckoutLoading(false);
        subscriptionActions.setIsProcessingCheckout(false);

        hasShownPurchaseSuccessToastRef.current = false;

        startPolling(
          () => {
            showPurchaseSuccessToastOnce();
            setIsOpenSubscriptionModal(false, undefined);
            enablePremiumOnboardingModel();
            handleResetPremiumOnboardingKey();
            subscriptionActions.setCheckoutContext(null);
          },
          () => {
            setIsOpenSubscriptionModal(false, undefined);
            subscriptionActions.setCheckoutContext(null);
          }
        );
      },
    });

    return () => {
      clearFlowHandlers("subscriptionCheckout");
    };
  }, [
    clearFlowHandlers,
    sendTrackingEvent,
    setCheckoutStep,
    setFlowHandlers,
    setIsOpenSubscriptionModal,
    showPurchaseSuccessToastOnce,
    startPolling,
    subscriptionActions,
    subscriptionStore,
    userId,
  ]);

  // Update Paddle customer ID if available to enable Paddle Retain
  useEffect(() => {
    if (isPaddleRetainAvailable && paddleCustomerId) {
      updatePaddle({
        pwCustomer: {
          id: paddleCustomerId,
        },
      });
    }
  }, [isPaddleRetainAvailable, paddleCustomerId, updatePaddle]);

  const createOrder = async (packageId: string) => {
    subscriptionActions.setIsCreatingOrder(true);
    try {
      const response = await createOrderMutation.mutateAsync({
        packageId,
        quantity: 1,
      });

      return response?.orderId || "";
    } catch (error) {
      toast.error("", {
        description:
          "We encountered an unexpected error. Please try again later",
      });
      const logger = new Logger("PaddleCheckout");
      logger.sendError(error);
      return "";
    } finally {
      subscriptionActions.setIsCreatingOrder(false);
    }
  };

  const trackPackageSelected = (
    product: ProductModel,
    purchaseSource: TPurchaseSource,
    transactionId: string
  ) => {
    sendTrackingEvent({
      name: EventKeys.PackageSelected,
      payload: {
        currency: product.defaultPrice.currencyIsoFormat,
        items: [
          {
            item_id: product.durationUnitLabel,
            item_name: product.description,
            price: product.defaultPrice.price,
            quantity: 1,
          },
        ],
        transaction_id: transactionId,
        value: product.defaultPrice.price,
        vulcan_source: purchaseSource,
        vulcan_user_id: userId,
      },
    });
  };

  const handleBuySubscription = async (
    purchaseSource: TPurchaseSource,
    product: ProductModel
  ) => {
    const { id: productId } = product;

    // Lazy-loading guards (preserved from the V1 flow) — apply to both V1 and V2.
    // Checked before showing any overlay so a guard failure never leaves it hanging.
    if (!isPaddleAvailable()) {
      console.warn("Paddle checkout is not available - token missing");
      toast.error("Payment system not available. Please try again later.");
      return;
    }
    if (!paddleReady) {
      toast.error("Payment system not ready. Please try again.");
      return;
    }

    // Start loading so LoadingProcessing covers the entire flow without gaps.
    // Cleared in onLoaded (success) or in finally when Paddle was never opened (failure).
    subscriptionActions.setIsPaddleCheckoutLoading(true);

    let path: "v1" | "v2" | undefined;
    let threw = false;
    try {
      path = await openForProduct({
        product,
        flow: "subscriptionCheckout",
        container: PADDLE_CONTAINER_CLASSNAME.PADDLE_CHECKOUT_CONTAINER,
        customer: checkoutCustomer,
        paddleOpts: {
          initialHeight: 600,
          locale,
          theme: "light",
        },
        // V1 leg: createOrder + checkout + all V1-only side effects (order context, success URLs).
        resolveV1TransactionId: async () => {
          const orderId = await createOrder(productId);
          if (!orderId) {
            // createOrder already surfaced the error toast.
            return "";
          }

          trackPackageSelected(product, purchaseSource, orderId);
          subscriptionActions.setIsProcessingCheckout(true);
          subscriptionActions.setCheckoutContext({
            orderId,
            product,
            productId,
            purchaseSource,
          });

          const { successUrl, cancelUrl } = getOrderCompleteUrl(
            orderId,
            purchaseSource,
            product
          );
          const checkoutResponse = await handleCheckoutMutation.mutateAsync({
            cancelUrl,
            orderId,
            paymentMethod: EPAYMENT_METHOD.CARD,
            paymentVendor: EPAYMENT_VENDOR.STRIPE,
            successUrl,
          });

          return checkoutResponse?.extend?.paddle?.transactionId ?? "";
        },
      });

      // V2 has no FE order id. We still MUST set the checkout context: the shared
      // subscriptionCheckout onSuccess/onError handlers bail out when checkoutContext is null,
      // so without this V2 purchases skip subscription polling, the polling loading state, the
      // success toast, and the modal close (the V1 transactionId flow set this in its V1 leg).
      // orderId is empty for V2 — the success handler uses the Paddle event transactionId.
      if (path === "v2") {
        subscriptionActions.setCheckoutContext({
          orderId: "",
          product,
          productId,
          purchaseSource,
        });
        trackPackageSelected(product, purchaseSource, "");
      }
    } catch (error) {
      threw = true;
      // Fail-closed checkout errors are already toasted + logged inside the opener.
      if (!(error instanceof CheckoutError)) {
        toast.error("", {
          description:
            "We encountered an unexpected error. Please try again later",
        });
        const logger = new Logger("PaddleCheckout");
        logger.sendError(error);
      }
    } finally {
      // `path === undefined` with no throw means the in-flight guard skipped this call — another
      // checkout already owns the overlay, so leave it intact. Otherwise tear down as usual.
      const skippedByGuard = path === undefined && !threw;
      if (!skippedByGuard) {
        subscriptionActions.setIsProcessingCheckout(false);
        const opened = path === "v1" || path === "v2";
        if (!opened) {
          subscriptionActions.setIsPaddleCheckoutLoading(false);
        }
      }
    }
  };

  useEffect(() => {
    // loading until redirect
    if (isPending) {
      subscriptionActions.setIsProcessingCheckout(isPending);
    }

    return () => {
      const { isProcessingCheckout } = subscriptionStore.getState();
      if (isProcessingCheckout) {
        subscriptionActions.setIsProcessingCheckout(false);
      }
    };
  }, [isPending, subscriptionActions, subscriptionStore]);

  const handleManageBillingHistory = (userId: string) => {
    const callbackUrl = globalThis.location.href;
    subscriptionActions.setIsProcessingBillingHistory(true);

    startTransition(() => {
      billingHistoryMutation.mutate(
        {
          customerId: userId,
          returnUrl: callbackUrl,
          vendor: EPAYMENT_VENDOR.STRIPE,
        },
        {
          onError: () => {
            subscriptionActions.setIsProcessingBillingHistory(false);
          },
          onSettled: () => {
            subscriptionActions.setIsProcessingBillingHistory(false);
          },
        }
      );
    });
  };

  const getPaymentInfo = async (
    purchaseSource: TPurchaseSource,
    product: ProductModel
  ) => {
    subscriptionActions.setIsFetchingPaymentInfo(true);
    try {
      const response = await refetchPaymentInfo();

      if (!response.data) {
        return null;
      }

      const { id: packageId } = product;

      const orderId = await createOrder(packageId);

      const { successUrl, cancelUrl } = getOrderCompleteUrl(
        orderId,
        purchaseSource,
        product
      );

      subscriptionActions.setIsProcessingCheckout(true);
      try {
        const prorationInfo = await handleQuickCheckoutMutation.mutateAsync({
          cancelUrl,
          dryRun: true,
          orderId,
          paymentMethod: EPAYMENT_METHOD.CARD,
          paymentVendor: EPAYMENT_VENDOR.STRIPE,
          successUrl,
        });

        return {
          orderId,
          paymentInfo: response.data?.stripe,
          prorationInfo,
        };
      } catch (error) {
        toast.error("", {
          description:
            "We encountered an unexpected error. Please try again later",
        });
        const logger = new Logger("PaddleCheckout");
        logger.sendError(error);
        return {
          orderId,
          paymentInfo: response.data?.stripe,
          prorationInfo: new CheckoutResponseModel(),
        };
      } finally {
        subscriptionActions.setIsProcessingCheckout(false);
      }
    } catch {
      return null;
    } finally {
      subscriptionActions.setIsFetchingPaymentInfo(false);
    }
  };

  // Helper to wrap polling in a Promise
  const pollForSubscriptionUpdate = (): Promise<void> =>
    new Promise<void>((resolve, reject) => {
      const onSuccess = () => {
        toast.success("Subscription updated successfully");
        enablePremiumOnboardingModel();
        handleResetPremiumOnboardingKey();
        resolve();
      };

      const onError = () => {
        toast.error(
          "Update completed but failed to sync. Please refresh the page."
        );
        reject(new Error("Failed to sync subscription after update"));
      };

      startPolling(onSuccess, onError);
    });

  const handleUpdateSubscription = async (
    orderId: string,
    purchaseSource: TPurchaseSource,
    product: ProductModel
  ) => {
    if (!orderId) {
      toast.error("Invalid order ID");
      return;
    }

    const { successUrl, cancelUrl } = getOrderCompleteUrl(
      orderId,
      purchaseSource,
      product
    );

    const purchaseParams = {
      ecommerce: {
        currency: product.defaultPrice.currencyIsoFormat,
        items: [
          {
            item_id: product.durationUnitLabel,
            item_name: product.description,
            price: product.defaultPrice.price,
            quantity: 1,
          },
        ],
        transaction_id: orderId,
        value: product.defaultPrice.price,
      },
      vulcan_source: purchaseSource,
      vulcan_user_id: userId,
    };

    subscriptionActions.setIsProcessingCheckout(true);
    try {
      await handleQuickCheckoutMutation.mutateAsync({
        cancelUrl,
        orderId,
        paymentMethod: EPAYMENT_METHOD.CARD,
        paymentVendor: EPAYMENT_VENDOR.STRIPE,
        successUrl,
      });

      // Track success
      sendTrackingEvent({
        name: EventKeys.DSPurchaseSuccess,
        payload: purchaseParams,
      });

      // Start polling for subscription update
      await pollForSubscriptionUpdate();
    } catch (error) {
      console.error("Subscription update failed:", error);

      // Track failure
      sendTrackingEvent({
        name: EventKeys.DSPurchaseFailed,
        payload: purchaseParams,
      });

      toast.error("We encountered an unexpected error. Please try again later");
      const logger = new Logger("PaddleCheckout");
      logger.sendError(error);
      return null;
    } finally {
      subscriptionActions.setIsProcessingCheckout(false);
    }
  };

  return {
    getPaymentInfo,
    handleBuySubscription,
    handleManageBillingHistory,
    handleUpdateSubscription,
    isInFlight,
    isLoading,
  };
};
