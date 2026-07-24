import type { RefObject } from "react";
import { useCallback } from "react";

import { useGetFreeUsage } from "@/hooks/usage/use-get-free-usage";
import { useUpdateFreeUsageMutation } from "@/hooks/usage/use-update-free-usage-mutation";
import type { TCreateGlobalStore } from "@/store/global/store";
import { freeUsageCoordinator } from "@/utils/free-usage-coordinator";

/**
 * Free Usage Coordinator Service
 *
 * Purpose:
 * Centralizes and coordinates free usage updates to ensure
 * - Only one update request runs at a time
 * - Prevents duplicate or concurrent updates
 * - Synchronizes updated free usage data back into the global store
 *
 * Typical flow:
 * 1. Trigger `updateFreeUsage` when usage may have changed.
 * 2. If no update is running, it starts a mutation and waits for completion.
 * 3. On success, refetches the latest usage and updates the global store.
 * 4. If already updating, it avoids duplicate requests and returns gracefully.
 *
 * Provides:
 * - Singleton instance (`freeUsageCoordinator`) for global coordination
 * - `reset()` to clear state (useful in tests or manual recovery)
 * - `isCurrentlyUpdating()` to check update status
 */
export const useFreeUsageUpdater = (
  store: RefObject<TCreateGlobalStore | null>
) => {
  const updateFreeUsageMutation = useUpdateFreeUsageMutation();
  const { refetch: refetchFreeUsage } = useGetFreeUsage({ enabled: false });

  const updateFreeUsage = useCallback(
    async (): Promise<boolean> =>
      await freeUsageCoordinator.updateFreeUsage(
        store,
        updateFreeUsageMutation,
        refetchFreeUsage
      ),
    [store, updateFreeUsageMutation, refetchFreeUsage]
  );

  const isUpdating = useCallback(
    (): boolean => freeUsageCoordinator.isCurrentlyUpdating(),
    []
  );

  const reset = useCallback((): void => {
    freeUsageCoordinator.reset();
  }, []);

  return {
    isPending: updateFreeUsageMutation.isPending,
    isUpdating,
    reset,
    updateFreeUsage,
  };
};
