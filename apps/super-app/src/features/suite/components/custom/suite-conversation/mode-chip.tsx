"use client";

import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

import type { ModeChipProps } from "./types";

export function SuiteModeChip({ label, className }: ModeChipProps) {
  return (
    <div
      data-testid={DATA_TEST_ID.suite.custom.suiteModeChip}
      className={cn("flex flex-col items-end self-stretch", className)}
    >
      <span className="gap-v1-structural-content-micro pt-v1-optical-subtle pb-v1-structural-content-micro ps-v1-structural-content-micro pe-v1-structural-content-micro rounded-v1-pill border-v1-border-status-info inline-flex items-center border">
        <span className="ps-v1-structural-content-micro pe-v1-structural-content-micro text-meta-scale-0 text-v1-text-status-info font-normal">
          {label}
        </span>
      </span>
    </div>
  );
}
