"use client";

import XIcon from "@/features/suite/assets/icons/x-icon.svg";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

import type { UsecaseChipData } from "./types";

export function PromptInputUsecaseChip({
  icon,
  label,
  onDismiss,
}: UsecaseChipData) {
  return (
    <div
      data-testid={DATA_TEST_ID.suite.custom.promptInputUsecaseChip}
      className="border-v1-chip-border-soften rounded-v1-circle py-v1-optical-normal ps-v1-structural-content-normal pe-v1-structural-content-tight gap-v1-structural-content-none hover:bg-v1-surface-overlay-interactive-hover flex flex-row items-center overflow-hidden border"
    >
      <div className="gap-v1-structural-content-micro flex items-center">
        {icon}
        <span className="text-functional-scale-2 text-v1-text-hierarchy-primary px-v1-structural-content-micro font-normal capitalize">
          {label}
        </span>
      </div>
      <button
        type="button"
        className="hover:rounded-v1-circle hover:bg-v1-surface-overlay-interactive-hover flex size-5 items-center justify-center rounded-full"
        onClick={onDismiss}
      >
        <XIcon className="text-v1-action-icon-tertiary size-4" aria-hidden />
      </button>
    </div>
  );
}
