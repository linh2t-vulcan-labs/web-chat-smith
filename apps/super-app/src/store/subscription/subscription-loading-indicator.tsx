"use client";

import { LoadingProcessing } from "@/components/loading-icon";

import { useSubscriptionLoading } from "./hooks";

/**
 * Centralized subscription loading indicator component.
 * This should be placed at a high level (e.g., layout) to show
 * a single loading indicator for all subscription operations.
 */
export function SubscriptionLoadingIndicator() {
  const isLoading = useSubscriptionLoading();

  return <LoadingProcessing isSpinning={isLoading} />;
}
