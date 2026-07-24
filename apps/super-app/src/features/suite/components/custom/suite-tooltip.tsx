"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import type { ReactElement, ReactNode } from "react";

import { cn } from "@/features/suite/utils/classnames";

type SuiteTooltipSide = "top" | "bottom" | "left" | "right";
type SuiteTooltipAlign = "start" | "center" | "end";

export interface SuiteTooltipProps {
  /** Tooltip label. */
  content: ReactNode;
  /** Element that triggers the tooltip on hover (e.g. an icon button). */
  children: ReactElement;
  /** Side relative to the trigger; defaults to top. */
  side?: SuiteTooltipSide;
  /** Alignment along the side; defaults to center. Use "end" to right-align. */
  align?: SuiteTooltipAlign;
  /** Gap (px) between tooltip and trigger; defaults to 4 per design. */
  sideOffset?: number;
  /** Hover open delay (ms). */
  delay?: number;
  className?: string;
}

/**
 * Suite-styled tooltip — overrides the shared ui/tooltip colors/spacing to the Figma tooltip token
 * set and drops the arrow. Built on @base-ui directly so the arrow can be omitted without touching
 * the shared component. Shows on hover only.
 */
export function SuiteTooltip({
  content,
  children,
  side = "top",
  align = "center",
  sideOffset = 4,
  delay = 200,
  className,
}: SuiteTooltipProps) {
  return (
    <TooltipPrimitive.Provider delay={delay}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger render={children} />
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Positioner
            side={side}
            align={align}
            sideOffset={sideOffset}
            className="suite-root isolate z-10"
          >
            <TooltipPrimitive.Popup
              data-slot="suite-tooltip"
              className={cn(
                // Figma: surface-hierarchy-tooltip bg, text-hierarchy-inverse, radius 8px, px 6 / py 4, 12px text.
                "bg-v1-surface-hierarchy-tooltip text-v1-text-hierarchy-inverse rounded-v1-standard px-v1-optical-normal py-v1-structural-content-micro text-functional-scale-0 shadow-figma-elevation-structural-lift inline-flex w-fit items-center justify-center text-center leading-4 font-normal",
                // Letter-spacing 0.12px (functional_scale-sentence-0) from Figma is omitted: no tracking utility exists.
                "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
                className
              )}
            >
              {content}
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
