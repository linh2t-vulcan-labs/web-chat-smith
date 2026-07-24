import { getPublicEnv } from "@cs/env/client";
import { useState } from "react";
import { flushSync } from "react-dom";
import { toast } from "sonner";

import { getUserSubscriptionQueryKey } from "@/hooks/subscriptions";
import { useQueryClient } from "@/libs/react-query";
import { delay } from "@/utils/commons/helpers";

import {
  GET_TRANSACTIONS_OF_SUBSCRIPTION_QUERY_KEY,
  USE_GET_PAYMENT_SUBSCRIPTIONS_QUERY_KEY,
  useCancelSubscription,
  useUncancelSubscription,
} from "./base";

interface THandleOptions {
  onSuccess?: () => void | Promise<void>;
  onError?: () => void;
}

/** Upper bound on the post-mutation refresh so a hung/slow refetch can't wedge the loading modal open forever. */
const REFRESH_SUBSCRIPTIONS_TIMEOUT_MS = 15_000;

/**
 * In this environment, `useMutation`'s React binding does not reliably notify the
 * component when a mutation settles (confirmed: the mutation cache flips to
 * "success" within ~2s, but neither the observer's `status`/`isPending` nor the
 * `mutate()` `onSuccess`/`onError` callbacks ever fire) — that left the loading
 * modal stuck open forever even though the API call had already succeeded.
 * Poll the mutation object's own state directly instead of relying on React to
 * re-render when it changes.
 */
const MUTATION_POLL_INTERVAL_MS = 300;
const MUTATION_POLL_TIMEOUT_MS = 20_000;

export const useHandleFlowCancelSubscription = () => {
  const queryClient = useQueryClient();

  const [isPendingCancelFlow, setIsPendingCancelFlow] = useState(false);

  const cancelSubscriptionMutation = useCancelSubscription();
  const unCancelSubscriptionMutation = useUncancelSubscription();

  const refreshSubscriptionsAfterMutation = async (subscriptionId: string) => {
    await delay(getPublicEnv().CS_PUBLIC_DELAY_TIME_MANAGE_SUBSCRIPTION);
    await Promise.race([
      Promise.all([
        queryClient.invalidateQueries({
          queryKey: [USE_GET_PAYMENT_SUBSCRIPTIONS_QUERY_KEY],
          type: "active",
        }),
        queryClient.invalidateQueries({
          queryKey: [
            GET_TRANSACTIONS_OF_SUBSCRIPTION_QUERY_KEY,
            { subscriptionId },
          ],
          type: "active",
        }),
        queryClient.invalidateQueries({
          queryKey: [getUserSubscriptionQueryKey],
        }),
      ]),
      delay(REFRESH_SUBSCRIPTIONS_TIMEOUT_MS),
    ]);
  };

  const finishCancelFlow = async (
    isSuccess: boolean,
    subscriptionId: string,
    options?: THandleOptions
  ) => {
    if (!isSuccess) {
      flushSync(() => setIsPendingCancelFlow(false));
      options?.onError?.();
      toast.error(null, {
        description:
          "Something went wrong while processing your request. Please try again later!",
      });
      return;
    }

    try {
      await refreshSubscriptionsAfterMutation(subscriptionId);
      await options?.onSuccess?.();
    } catch {
      toast.error(null, {
        description:
          "Something went wrong while processing your request. Please try again later!",
      });
    } finally {
      // `flushSync` forces this update to commit immediately instead of being
      // silently dropped by whatever is swallowing batched updates queued
      // from deep inside this async chain in this environment (see the
      // polling workaround above this replaced — same underlying symptom).
      flushSync(() => setIsPendingCancelFlow(false));
    }
  };

  const runCancelFlowMutation = (
    mutation:
      | typeof cancelSubscriptionMutation
      | typeof unCancelSubscriptionMutation,
    subscriptionId: string,
    options?: THandleOptions
  ) => {
    setIsPendingCancelFlow(true);

    const mutationCache = queryClient.getMutationCache();
    const mutationCountBeforeCall = mutationCache.getAll().length;

    mutation.mutate(subscriptionId);

    const triggeredMutation = mutationCache
      .getAll()
      .at(mutationCountBeforeCall);
    if (!triggeredMutation) {
      // Should be unreachable (mutate() adds the cache entry synchronously) —
      // fail safe rather than leave the modal stuck.
      setIsPendingCancelFlow(false);
      options?.onError?.();
      return;
    }

    const startedAt = Date.now();
    const pollId = setInterval(() => {
      const { status } = triggeredMutation.state;

      if (status === "success" || status === "error") {
        clearInterval(pollId);
        finishCancelFlow(status === "success", subscriptionId, options);
        return;
      }

      if (Date.now() - startedAt > MUTATION_POLL_TIMEOUT_MS) {
        clearInterval(pollId);
        finishCancelFlow(false, subscriptionId, options);
      }
    }, MUTATION_POLL_INTERVAL_MS);
  };

  const handleCancelSubscription = (
    subscriptionId: string,
    options?: THandleOptions
  ) =>
    runCancelFlowMutation(cancelSubscriptionMutation, subscriptionId, options);

  const handleUncancelSubscription = (
    subscriptionId: string,
    options?: THandleOptions
  ) =>
    runCancelFlowMutation(
      unCancelSubscriptionMutation,
      subscriptionId,
      options
    );

  return {
    handleCancelSubscription,
    handleUncancelSubscription,
    // `cancelSubscriptionMutation.isPending`/`unCancelSubscriptionMutation.isPending`
    // come from react-query's React binding, which in this environment never flips
    // back once a mutation resolves (see the diagnostic comment above) — ORing them
    // in here would keep `isLoading` stuck `true` forever after every call.
    // `isPendingCancelFlow` alone (driven by the poll + `flushSync` above) is the
    // only reliable signal.
    isLoading: isPendingCancelFlow,
    cancelSubscriptionMutation,
    unCancelSubscriptionMutation,
  };
};
