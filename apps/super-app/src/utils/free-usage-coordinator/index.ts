import type { RefObject } from "react";

import type { useGetFreeUsage } from "@/hooks/usage/use-get-free-usage";
import type { useUpdateFreeUsageMutation } from "@/hooks/usage/use-update-free-usage-mutation";
import type { TCreateGlobalStore } from "@/store/global/store";

/**
 * Free Usage Coordinator Service
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles free usage updates
 * - Open/Closed: Easy to extend with new update strategies
 * - Liskov Substitution: Can be replaced with different implementations
 * - Interface Segregation: Clean, focused interface
 * - Dependency Inversion: Depends on abstractions, not concretions
 *
 * KISS: Simple, clear interface
 * DRY: Centralized logic, no duplication
 */
class FreeUsageCoordinator {
  private static instance: FreeUsageCoordinator;
  private isUpdating = false;
  private updatePromise: Promise<void> | null = null;

  private constructor() {
    // Intentionally empty: private constructor enforces the singleton pattern.
  }

  static getInstance(): FreeUsageCoordinator {
    if (!FreeUsageCoordinator.instance) {
      FreeUsageCoordinator.instance = new FreeUsageCoordinator();
    }
    return FreeUsageCoordinator.instance;
  }

  /**
   * Updates free usage if not already updating
   * Returns true if update was initiated, false if already updating
   */
  async updateFreeUsage(
    store: RefObject<TCreateGlobalStore | null>,
    updateFreeUsageMutation: ReturnType<typeof useUpdateFreeUsageMutation>,
    refetchFreeUsage: ReturnType<typeof useGetFreeUsage>["refetch"]
  ): Promise<boolean> {
    // If already updating, return false
    if (this.isUpdating) {
      return false;
    }

    // If there's already a pending update, wait for it
    if (this.updatePromise) {
      await this.updatePromise;
      return false;
    }

    // Start new update
    this.isUpdating = true;
    this.updatePromise = FreeUsageCoordinator.performUpdate(
      store,
      updateFreeUsageMutation,
      refetchFreeUsage
    );

    try {
      await this.updatePromise;
      return true;
    } finally {
      this.isUpdating = false;
      this.updatePromise = null;
    }
  }

  private static async performUpdate(
    store: RefObject<TCreateGlobalStore | null>,
    updateFreeUsageMutation: ReturnType<typeof useUpdateFreeUsageMutation>,
    refetchFreeUsage: ReturnType<typeof useGetFreeUsage>["refetch"]
  ): Promise<void> {
    await updateFreeUsageMutation.mutateAsync();

    try {
      const response = await refetchFreeUsage();
      if (response.isSuccess && response.data) {
        const { data } = response;
        if (data && store.current) {
          store.current.getState().setChatFreeUsage(data);
        }
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }

  /**
   * Reset the coordinator state (useful for testing or manual reset)
   */
  reset(): void {
    this.isUpdating = false;
    this.updatePromise = null;
  }

  /**
   * Check if currently updating
   */
  isCurrentlyUpdating(): boolean {
    return this.isUpdating;
  }
}

export const freeUsageCoordinator = FreeUsageCoordinator.getInstance();
