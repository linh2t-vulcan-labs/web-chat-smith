"use client";

import { useQuotaCountdown } from "@/features/suite/hooks/use-quota-countdown";

import { PromptInputHitLimitCard } from "./hit-limit-card";

export interface QuotaHitLimitCardProps {
  /** Unix seconds when the quota window resets (from quota.resetAt). */
  resetAt?: number;
  /** Fired once when the countdown hits zero — caller refetches quota to re-evaluate the limit. */
  onExpired: () => void;
  className?: string;
}

// Owns the 1s countdown tick so ONLY this small card re-renders each second — never the whole
// sidebar. The sidebar mounts it solely while the quota is reached, so the tick can't run otherwise.
// Renders nothing when there's no active countdown (no/expired resetAt).
export function QuotaHitLimitCard({
  resetAt,
  onExpired,
  className,
}: QuotaHitLimitCardProps) {
  const countdown = useQuotaCountdown(resetAt, onExpired);
  if (!countdown) {
    return null;
  }
  return (
    <PromptInputHitLimitCard countdown={countdown} className={className} />
  );
}
