import { getPublicEnv } from "@cs/env/client";
import { useState } from "react";
import { toast } from "sonner";

import type { ProductModel } from "@/core/models/product";
import { useHttpClient } from "@/hooks/http-client";
import { getUserSubscriptionQueryKey } from "@/hooks/subscriptions";
import { useQueryClient } from "@/libs/react-query";
import { delay } from "@/utils/commons/helpers";

import type { TGetPreviewUpgradeDowngradeSubscriptionPayload } from "./base";
import {
  GET_TRANSACTIONS_OF_SUBSCRIPTION_QUERY_KEY,
  previewUpgradeDowngradeSubscriptionQueryKey,
  previewUpgradeDowngradeSubscriptionRequest,
  USE_GET_PAYMENT_SUBSCRIPTIONS_QUERY_KEY,
} from "./base";
import { useUpgradeDowngradeSubscription } from "./base/use-upgrade-downgrade-subscription";

interface THandleFlowUpdownSubscriptionParams {
  subscriptionId: string;
  quantity?: number;
  countryGroupId?: string;
}

type TPreviewSelectedPlanResult =
  | {
      success: true;
      data: Awaited<
        ReturnType<typeof previewUpgradeDowngradeSubscriptionRequest>
      >;
    }
  | { success: false; error: unknown };

interface THandleOptions {
  onSuccess?: () => void | Promise<void>;
  onError?: () => void;
}

export const useHandleFlowUpdownSubscription = (
  params: THandleFlowUpdownSubscriptionParams
) => {
  const { subscriptionId, quantity = 1, countryGroupId } = params;
  const { httpClient } = useHttpClient();
  const queryClient = useQueryClient();

  const {
    mutate: upgradeSubscription,
    isPending: isUpgrading,
    reset: resetUpgrade,
    error: upgradeError,
  } = useUpgradeDowngradeSubscription();

  const [isPreviewingPlan, setIsPreviewingPlan] = useState(false);

  const previewSelectedPlan = async (
    product: ProductModel
  ): Promise<TPreviewSelectedPlanResult> => {
    const payload: TGetPreviewUpgradeDowngradeSubscriptionPayload = {
      countryGroupId,
      productId: product.id,
      quantity,
      subscriptionId,
    };

    try {
      setIsPreviewingPlan(true);
      const data = await queryClient.fetchQuery({
        queryFn: () =>
          previewUpgradeDowngradeSubscriptionRequest({ httpClient, payload }),
        queryKey: previewUpgradeDowngradeSubscriptionQueryKey(payload),
      });

      return { data, success: true };
    } catch (error) {
      return { error, success: false };
    } finally {
      setIsPreviewingPlan(false);
    }
  };

  const upgradeDowngradeSelectedPlan = (
    product: ProductModel,
    options?: THandleOptions
  ) => {
    upgradeSubscription(
      {
        countryGroupId,
        productId: product.id,
        quantity,
        subscriptionId,
      },
      {
        onError: () => {
          toast.error(null, {
            description:
              "Something went wrong while processing your request. Please try again later!",
          });
          options?.onError?.();
        },
        onSuccess: async () => {
          try {
            // keep a short delay after the API success before refreshing data
            await delay(
              getPublicEnv().CS_PUBLIC_DELAY_TIME_MANAGE_SUBSCRIPTION
            );
            // Invalidate without the `type: "active"` filter: if the
            // subscriptions/transactions observers happen to be inactive when
            // this runs, an "active"-only invalidation would skip them
            // entirely (no refetch, no stale mark). Combined with the long
            // staleTime, the next mount would then serve the cached pre-upgrade
            // product_name until a hard reload. Marking them stale ensures the
            // new product_name from GET /subscription is picked up.
            await Promise.all([
              queryClient.invalidateQueries({
                queryKey: [USE_GET_PAYMENT_SUBSCRIPTIONS_QUERY_KEY],
              }),
              queryClient.invalidateQueries({
                queryKey: [
                  GET_TRANSACTIONS_OF_SUBSCRIPTION_QUERY_KEY,
                  { subscriptionId },
                ],
              }),
              queryClient.invalidateQueries({
                queryKey: [getUserSubscriptionQueryKey],
              }),
            ]);
            await options?.onSuccess?.();
          } catch {
            toast.error(null, {
              description:
                "Something went wrong while processing your request. Please try again later!",
            });
          }
        },
      }
    );
  };

  return {
    previewSelectedPlan,
    previewState: {
      isPreviewing: isPreviewingPlan,
    },
    upgradeDowngradeSelectedPlan,
    upgradeState: {
      isUpgrading,
      reset: resetUpgrade,
      upgradeError,
    },
  };
};
