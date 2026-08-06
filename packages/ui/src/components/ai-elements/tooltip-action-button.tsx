"use client";

import type { ReactElement } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "#components/shadcn/tooltip";

export interface TooltipActionButtonProps {
  tooltip?: string;
  button: ReactElement;
}

/**
 * Wraps an action button in a tooltip when `tooltip` is provided, otherwise
 * renders the button as-is — the shared pattern behind `ArtifactAction` and
 * `MessageAction` so each doesn't reimplement the same conditional
 * `TooltipProvider`/`Tooltip` wiring.
 */
export const TooltipActionButton = ({
  tooltip,
  button,
}: TooltipActionButtonProps) => {
  if (!tooltip) {
    return button;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={button} />
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
