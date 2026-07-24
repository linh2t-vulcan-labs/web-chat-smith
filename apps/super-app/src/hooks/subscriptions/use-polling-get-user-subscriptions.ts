"use client";

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { toast } from "sonner";

import type { TDurationUnitLabel } from "@/core/models/product";
import type { SubscriptionItemModel } from "@/core/models/subscription";
import { SubscriptionModel } from "@/core/models/subscription";
import { subscriptionClientService } from "@/core/repositories";
import { USE_GET_PAYMENT_SUBSCRIPTIONS_QUERY_KEY } from "@/features/manage-account-modal/hooks/base/use-get-payment-subscriptions";
import { useFreeUsageUpdater } from "@/hooks/usage/use-free-usage-updater";
import { TransformerBuilder } from "@/libs/class-transformer";
import dayjs from "@/libs/dayjs";
import { isEqual } from "@/libs/lodash-es";
import { parseAsBoolean, parseAsStringEnum, useQueryState } from "@/libs/nuqs";
import { useQuery, useQueryClient } from "@/libs/react-query";
import { EventKeys, useSendTrackingEvent } from "@/libs/tracking-event";
import { useGlobalState, useGlobalStore } from "@/store/global/hooks";
import {
  useSubscriptionActions,
  useSubscriptionState,
} from "@/store/subscription";
import { localStorageImpl } from "@/utils/commons/helpers";
import {
  ENABLE_PREMIUM_ONBOARDING_MODAL_KEY,
  HAS_SEEN_PREMIUM_ONBOARDING_MODAL_KEY,
} from "@/utils/commons/keys";
import type { TPurchaseSource } from "@/utils/commons/types";
import { ORDER_QUERY_PARAMS } from "@/utils/constants/order";
import { subscriptionPollingManager } from "@/utils/subscription-polling-manager";

import { getUserSubscriptionQueryKey } from "./use-get-user-subscription";

const POLLING_TIME = 1000; // 1s;
const DURATION_POLLING_TIME = 60 * 1000; // 1 min;

export const durationUnitParam = parseAsStringEnum<TDurationUnitLabel>([
  "week",
  "month",
  "year",
  "quarter",
]);

export const usePollingUserSubscriptions = () => {
  const queryClient = useQueryClient();
  const userSubscriptionInfo = useGlobalState(
    (state) => state.userSubscriptionInfo
  );
  const setUserSubscriptionInfo = useGlobalState(
    (state) => state.setUserSubscriptionInfo
  );
  const isFinishFetchProfile = useGlobalState(
    (state) => state.isFinishFetchProfile
  );

  const userId = useGlobalState((state) => state.user.id);
  const { sendTrackingEvent } = useSendTrackingEvent();
  const globalStore = useGlobalStore();

  const { updateFreeUsage } = useFreeUsageUpdater({ current: globalStore });

  // Query Params state
  const [orderCompleteParam, setOrderCompleteParam] = useQueryState(
    ORDER_QUERY_PARAMS.ORDER_COMPLETE,
    parseAsBoolean
  );
  const [selectedPackageIdParam, setPackageIdParam] = useQueryState(
    ORDER_QUERY_PARAMS.PACKAGE_ID
  );
  const [purchaseSourceParam, setPurchaseSourceParam] = useQueryState(
    ORDER_QUERY_PARAMS.PURCHASE_SOURCE,
    {
      defaultValue: "main",
    }
  );
  const [orderIdParam, setOrderIdParam] = useQueryState(
    ORDER_QUERY_PARAMS.ORDER_ID
  );
  const [priceParam, setPriceParam] = useQueryState(ORDER_QUERY_PARAMS.PRICE);
  const [currencyParam, setCurrencyParam] = useQueryState(
    ORDER_QUERY_PARAMS.CURRENCY
  );
  const [packageNameParam, setPackageNameParam] = useQueryState(
    ORDER_QUERY_PARAMS.PACKAGE_NAME
  );
  const [packageDurationUnitParam, setPackageDurationUnitParam] = useQueryState(
    ORDER_QUERY_PARAMS.PACKAGE_DURATION_UNIT,
    durationUnitParam.withDefault("month")
  );

  const pollingManagerRef = useRef(subscriptionPollingManager);
  const pollingManager = pollingManagerRef.current;

  // Use subscription store for loading state management
  const subscriptionActions = useSubscriptionActions();
  const { setIsPolling } = subscriptionActions;
  const isPolling = useSubscriptionState((state) => state.isPolling);

  // Track if we've already processed query params to avoid race conditions
  const hasProcessedQueryParamsRef = useRef(false);
  const lastProcessedParamsRef = useRef<string>("");

  // Compute if query params indicate polling should be active
  const shouldPollFromQueryParams = useMemo(
    () => !!(orderCompleteParam && selectedPackageIdParam),
    [orderCompleteParam, selectedPackageIdParam]
  );

  // Initialize polling loading state synchronously based on query params
  // This happens before render to avoid race conditions
  // oxlint-disable-next-line react/react-compiler -- intentionally uses useMemo (not useEffect) as a synchronous side-effect trigger during render to avoid a race between query-param detection and the first paint; behavior-sensitive, out of scope to restructure here
  useMemo(() => {
    if (shouldPollFromQueryParams && !isPolling) {
      setIsPolling(true);
    }
  }, [shouldPollFromQueryParams, isPolling, setIsPolling]);

  // Computed loading state: combines polling state with URL params check
  const isLoading = isPolling || shouldPollFromQueryParams;

  const { refetch } = useQuery({
    enabled: false,
    queryFn: async () => await subscriptionClientService.getUserSubscriptions(),
    queryKey: [getUserSubscriptionQueryKey],
    select: (data) => {
      const [error, response] = data;

      if (error) {
        return new TransformerBuilder(SubscriptionModel)
          .format({})
          .toPlainCamelCase() as SubscriptionModel;
      }

      return response;
    },
  });

  const handleResetPremiumOnboardingKey = useCallback(() => {
    localStorageImpl.remove(HAS_SEEN_PREMIUM_ONBOARDING_MODAL_KEY);
  }, []);

  const enablePremiumOnboardingModel = useCallback(() => {
    localStorageImpl.save(ENABLE_PREMIUM_ONBOARDING_MODAL_KEY, true);
  }, []);

  const clearPolling = () => {
    pollingManager.clearPolling();
    setIsPolling(false);
  };

  const isSubscriptionDataUpdated = useCallback(
    (newData: SubscriptionItemModel[]) => {
      if (!newData || !userSubscriptionInfo.items) {
        return false;
      }
      const isDifferentData =
        userSubscriptionInfo.items.length !== newData.length ||
        userSubscriptionInfo.items.some(
          (subscription, i) => !isEqual(subscription, newData[i])
        );

      return isDifferentData;
    },
    [userSubscriptionInfo.items]
  );

  const startPolling = useCallback(
    (onSuccess?: () => void, onError?: () => void) => {
      // Register callbacks with the shared manager
      // If polling is already active, callbacks will be queued
      const isNewPolling = pollingManager.registerCallbacks({
        onError,
        onSuccess,
      });

      // Set loading state in store
      setIsPolling(true);

      // If polling is already active, just return (loading state is already set)
      if (!isNewPolling) {
        return;
      }
      const startTime = dayjs();
      const stopTime = startTime.add(1, "minute");

      const fetchData = async () => {
        // Check if polling is still active (might have been cleared by another instance)
        if (!pollingManager.isPollingActive()) {
          setIsPolling(false);
          return;
        }

        try {
          const result = await refetch();

          // Check again after async operation
          if (!pollingManager.isPollingActive()) {
            setIsPolling(false);
            return;
          }

          const newData = result.data;

          if (!newData) {
            // If no data returned, check timeout
            if (dayjs().isAfter(stopTime)) {
              pollingManager.executeErrorCallbacks();
              pollingManager.clearPolling();
              setIsPolling(false);
              toast.error(
                "Internal system error. Please contact CS for further support"
              );
            }
            return;
          }

          if (isSubscriptionDataUpdated(newData.items)) {
            // Use the coordinator to handle the update
            await updateFreeUsage();

            // Revalidate get latest payment subscriptions . Case Renew Subscription
            await queryClient.invalidateQueries({
              queryKey: [USE_GET_PAYMENT_SUBSCRIPTIONS_QUERY_KEY],
              type: "all",
            });

            setUserSubscriptionInfo(newData);

            // Execute all registered success callbacks before clearing
            pollingManager.executeSuccessCallbacks();

            // Clear polling after callbacks are executed
            pollingManager.clearPolling();
            setIsPolling(false);
          } else if (dayjs().isAfter(stopTime)) {
            pollingManager.executeErrorCallbacks();
            pollingManager.clearPolling();
            setIsPolling(false);
            toast.error(
              "Internal system error. Please contact CS for further support"
            );
          }
        } catch (error) {
          // Handle errors from refetch
          console.error("Error polling user subscriptions:", error);

          // Check if polling is still active before handling error
          if (pollingManager.isPollingActive()) {
            pollingManager.executeErrorCallbacks();
            pollingManager.clearPolling();
            setIsPolling(false);
            toast.error(
              "Failed to check subscription status. Please try again."
            );
          }
        }
      };

      const interval = setInterval(fetchData, POLLING_TIME);
      const timeout = setTimeout(() => {
        if (pollingManager.isPollingActive()) {
          pollingManager.executeErrorCallbacks();
          pollingManager.clearPolling();
          setIsPolling(false);
          toast.error(
            "Internal system error. Please contact CS for further support"
          );
        }
      }, DURATION_POLLING_TIME);

      pollingManager.setPollingInterval(interval);
      pollingManager.setTimeout(timeout);
    },
    [
      setIsPolling,
      refetch,
      isSubscriptionDataUpdated,
      updateFreeUsage,
      queryClient,
      setUserSubscriptionInfo,
      pollingManager,
    ]
  );

  // Legacy method for backward compatibility with URL params flow
  const pollUserSubscriptions = useCallback(
    (onSuccess?: () => void) => {
      if (selectedPackageIdParam) {
        startPolling(onSuccess);
      }
    },
    [selectedPackageIdParam, startPolling]
  );

  const clearQueryParams = useCallback(() => {
    // Reset processing flag
    hasProcessedQueryParamsRef.current = false;
    lastProcessedParamsRef.current = "";

    // Clear all query params
    setCurrencyParam(null);
    setPriceParam(null);
    setPurchaseSourceParam(null);
    setOrderCompleteParam(null);
    setPackageIdParam(null);
    setOrderIdParam(null);
    setPackageNameParam(null);
    setPackageDurationUnitParam(null);
  }, [
    setCurrencyParam,
    setOrderCompleteParam,
    setOrderIdParam,
    setPackageDurationUnitParam,
    setPackageIdParam,
    setPackageNameParam,
    setPriceParam,
    setPurchaseSourceParam,
  ]);

  // Compute all required params synchronously
  const queryParamsKey = useMemo(
    () =>
      JSON.stringify({
        currencyParam,
        isFinishFetchProfile,
        orderCompleteParam,
        orderIdParam,
        packageDurationUnitParam,
        packageNameParam,
        priceParam,
        purchaseSourceParam,
        selectedPackageIdParam,
        userId,
      }),
    [
      selectedPackageIdParam,
      priceParam,
      currencyParam,
      orderIdParam,
      orderCompleteParam,
      packageNameParam,
      packageDurationUnitParam,
      purchaseSourceParam,
      isFinishFetchProfile,
      userId,
    ]
  );

  // Process query params synchronously using useLayoutEffect to avoid race conditions
  // This runs synchronously after DOM mutations but before paint
  useLayoutEffect(() => {
    // Skip if we've already processed these exact params
    if (lastProcessedParamsRef.current === queryParamsKey) {
      return;
    }

    const isEnoughParams =
      selectedPackageIdParam &&
      priceParam &&
      currencyParam &&
      orderIdParam &&
      orderCompleteParam !== null &&
      orderCompleteParam !== undefined &&
      packageNameParam &&
      packageDurationUnitParam;

    if (!isFinishFetchProfile || !isEnoughParams || !userId) {
      // Reset processing flag if conditions aren't met
      if (hasProcessedQueryParamsRef.current) {
        hasProcessedQueryParamsRef.current = false;
        lastProcessedParamsRef.current = "";
      }
      return;
    }

    // Mark as processed to prevent duplicate processing
    hasProcessedQueryParamsRef.current = true;
    lastProcessedParamsRef.current = queryParamsKey;

    const purchaseParams = {
      ecommerce: {
        currency: currencyParam,
        items: [
          {
            item_id: packageDurationUnitParam,
            item_name: packageNameParam,
            price: Number(priceParam),
            quantity: 1,
          },
        ],
        transaction_id: orderIdParam,
        value: Number(priceParam),
      },
      vulcan_source: purchaseSourceParam as TPurchaseSource,
      vulcan_user_id: userId,
    };

    if (orderCompleteParam) {
      sendTrackingEvent({
        name: EventKeys.DSPurchaseSuccess,
        payload: purchaseParams,
      });

      // Start polling - loading state is already set by useMemo above
      pollUserSubscriptions(() => {
        enablePremiumOnboardingModel();
        handleResetPremiumOnboardingKey();
      });
      clearQueryParams();
    } else {
      sendTrackingEvent({
        name: EventKeys.DSPurchaseFailed,
        payload: purchaseParams,
      });
      // If order failed, clear polling state
      setIsPolling(false);
    }
  }, [
    queryParamsKey,
    isFinishFetchProfile,
    userId,
    selectedPackageIdParam,
    priceParam,
    currencyParam,
    orderIdParam,
    orderCompleteParam,
    packageNameParam,
    packageDurationUnitParam,
    purchaseSourceParam,
    sendTrackingEvent,
    pollUserSubscriptions,
    enablePremiumOnboardingModel,
    handleResetPremiumOnboardingKey,
    setIsPolling,
    clearQueryParams,
  ]);

  // Cleanup on unmount
  useLayoutEffect(
    () => () => {
      // Only clear polling if this instance started it
      // The manager will handle cleanup when all instances unmount
      if (pollingManager.isPollingActive()) {
        clearPolling();
      }
    },
    // pollingManager and clearPolling are stable references
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return {
    clearPolling,
    isLoading,
    pollUserSubscriptions, // Keep for backward compatibility
    startPolling,
  };
};
