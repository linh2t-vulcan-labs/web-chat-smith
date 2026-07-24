"use client";

import CrosshairIcon from "@/features/suite/assets/icons/toolbars/crosshair-icon.svg";
import MinusIcon from "@/features/suite/assets/icons/toolbars/minus-icon.svg";
import PlusIcon from "@/features/suite/assets/icons/toolbars/plus-icon.svg";
import { SuiteTooltip } from "@/features/suite/components/custom/suite-tooltip";

interface StudioZoomControlProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  /** Fit all cards to viewport. Also wired to zoom-label click. */
  onFit: () => void;
}

const TOOLTIP_ZOOM_SIDE_OFFSET = 10;
const iconGhostXxs =
  "inline-flex size-6 cursor-pointer items-center justify-center rounded-v1-pill p-v1-structural-content-micro text-v1-action-icon-secondary transition-colors hover:bg-v1-surface-overlay-interactive-hover";

export function StudioZoomControl({
  zoom,
  onZoomIn,
  onZoomOut,
  onFit,
}: StudioZoomControlProps) {
  return (
    <div className="rounded-v1-medium bg-v1-context-menu-background-primary border-v1-border-structural-subtle p-v1-structural-content-micro flex size-fit flex-row border">
      <div className="gap-v1-structural-content-micro flex size-fit flex-row items-center">
        <div className="flex flex-row items-center gap-0.5">
          <SuiteTooltip
            content="Zoom out"
            sideOffset={TOOLTIP_ZOOM_SIDE_OFFSET}
          >
            <button
              type="button"
              className={iconGhostXxs}
              onClick={onZoomOut}
              aria-label="Zoom out"
            >
              <MinusIcon className="text-v1-action-icon-secondary size-4" />
            </button>
          </SuiteTooltip>
          <button
            type="button"
            className="rounded-v1-pill px-v1-structural-content-micro py-v1-structural-content-micro text-functional-scale-0 text-v1-action-text-secondary hover:bg-v1-surface-overlay-interactive-hover inline-flex h-6 w-10 cursor-pointer items-center justify-center transition-colors"
            onClick={onFit}
            aria-label={`Zoom ${zoom}%, click to fit`}
          >
            {zoom}%
          </button>

          <SuiteTooltip content="Zoom in" sideOffset={TOOLTIP_ZOOM_SIDE_OFFSET}>
            <button
              type="button"
              className={iconGhostXxs}
              onClick={onZoomIn}
              aria-label="Zoom in"
            >
              <PlusIcon className="text-v1-action-icon-secondary size-4" />
            </button>
          </SuiteTooltip>
        </div>

        <div
          aria-hidden="true"
          className="bg-v1-border-status-divider-high h-4 w-px self-center"
        />

        <SuiteTooltip
          content="Zoom to fit"
          align="end"
          sideOffset={TOOLTIP_ZOOM_SIDE_OFFSET}
        >
          <button
            type="button"
            className={iconGhostXxs}
            onClick={onFit}
            aria-label="Fit to screen"
          >
            <CrosshairIcon className="text-v1-action-icon-secondary size-4" />
          </button>
        </SuiteTooltip>
      </div>
    </div>
  );
}
