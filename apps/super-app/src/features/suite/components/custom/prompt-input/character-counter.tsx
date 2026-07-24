"use client";

import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

// Hard cap for the prompt input. Submit must be blocked once the count exceeds this.
export const PROMPT_INPUT_MAX_CHARACTERS = 4000;
// The counter only becomes visible once the input reaches this length.
export const PROMPT_INPUT_COUNTER_VISIBLE_FROM = 3600;

export interface PromptInputCharacterCounterProps {
  /** Current character count of the input. */
  count: number;
  className?: string;
}

export function PromptInputCharacterCounter({
  count,
  className,
}: PromptInputCharacterCounterProps) {
  // Over the fixed 4000 limit -> the count turns red; the "/4000" suffix stays secondary either way.
  const isOverLimit = count > PROMPT_INPUT_MAX_CHARACTERS;

  return (
    <div
      data-testid={DATA_TEST_ID.suite.custom.promptInputCharacterCounter}
      className={cn(
        "py-v1-structural-content-micro px-v1-structural-component-small flex flex-row items-center justify-end self-stretch",
        className
      )}
    >
      <span
        className={cn(
          "text-functional-scale-0 text-end leading-4 font-normal",
          isOverLimit
            ? "text-v1-text-status-error"
            : "text-v1-text-hierarchy-secondary"
        )}
      >
        {count}
      </span>
      <span className="text-functional-scale-0 text-v1-text-hierarchy-secondary text-end leading-4 font-normal">
        /{PROMPT_INPUT_MAX_CHARACTERS}
      </span>
    </div>
  );
}
