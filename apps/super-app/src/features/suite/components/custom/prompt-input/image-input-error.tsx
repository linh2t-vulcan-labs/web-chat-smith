"use client";

import AlertIcon from "@/features/suite/assets/icons/alert-icon.svg";
import { cn } from "@/features/suite/utils/classnames";

interface ImageInputErrorProps {
  className?: string;
  alertIconSize?: string;
  alertIconWidth?: number;
  alertIconHeight?: number;
}

export function ImageInputError({
  className,
  alertIconSize = "size-6",
  alertIconWidth = 24,
  alertIconHeight = 24,
}: ImageInputErrorProps) {
  return (
    <div className={cn("relative size-13", className)}>
      <div className="rounded-v1-medium border-v1-border-status-error bg-v1-surface-status-error-subtle flex size-full items-center justify-center overflow-hidden border">
        <span className="rounded-v1-pill p-v1-structural-content-micro flex items-center justify-center overflow-hidden">
          <AlertIcon
            aria-hidden
            className={cn("text-v1-text-hierarchy-primary", alertIconSize)}
            width={alertIconWidth}
            height={alertIconHeight}
          />
        </span>
      </div>
    </div>
  );
}
