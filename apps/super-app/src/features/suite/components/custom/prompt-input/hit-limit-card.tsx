"use client";

import QuotaIcon from "@/features/suite/assets/icons/quota-icon.svg";
import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

export interface PromptInputHitLimitCardProps {
  /** Countdown until the limit resets, pre-formatted (e.g. "03:00:47"). */
  countdown: string;
  /** Leading message; defaults to the Figma copy. */
  message?: string;
  className?: string;
}

const DEFAULT_MESSAGE = "Hit Creative Studio limit! Please try again in";

export function PromptInputHitLimitCard({
  countdown,
  message = DEFAULT_MESSAGE,
  className,
}: PromptInputHitLimitCardProps) {
  return (
    <div
      data-testid={DATA_TEST_ID.suite.custom.promptInputHitLimitCard}
      className={cn(
        "border-v1-action-border-ghost bg-v1-surface-hierarchy-raised rounded-v1-medium gap-v1-optical-normal p-v1-optical-normal flex w-full flex-row items-center self-stretch overflow-hidden border",
        className
      )}
    >
      <span className="size-6">
        <QuotaIcon className="text-v1-level-gold-icon size-6" aria-hidden />
      </span>

      <div className="gap-v1-structural-content-micro flex min-w-0 flex-1 flex-row items-center">
        <span className="text-functional-scale-0 text-v1-level-gold-text leading-4 font-normal">
          {message}
        </span>
        <span className="text-functional-scale-0 text-v1-text-hierarchy-primary leading-4 font-semibold">
          {countdown}
        </span>
      </div>
    </div>
  );
}
