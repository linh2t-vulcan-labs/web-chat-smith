"use client";

import HandIcon from "@/features/suite/assets/icons/toolbars/hand-icon.svg";
import PointerIcon from "@/features/suite/assets/icons/toolbars/pointer-icon.svg";
import SquareDashedMousePointerIcon from "@/features/suite/assets/icons/toolbars/square-dashed-mouse-pointer-icon.svg";
import { SuiteTooltip } from "@/features/suite/components/custom/suite-tooltip";

import { STUDIO_MODE } from "./constants";
import type { StudioMode } from "./constants";

interface StudioToolbarProps {
  mode: StudioMode;
  spacePanning: boolean;
  onSetMode: (mode: StudioMode) => void;
}

const TOOLTIP_SIDE_OFFSET = 10;
export function StudioToolbar({
  mode,
  spacePanning,
  onSetMode,
}: StudioToolbarProps) {
  const selectActive = mode === STUDIO_MODE.select;
  const dragActive = mode === STUDIO_MODE.drag || spacePanning;
  const drawActive = mode === STUDIO_MODE.draw;

  const iconButtonBase =
    "inline-flex size-10 cursor-pointer items-center justify-center rounded-v1-pill p-v1-structural-component-micro text-v1-action-icon-secondary transition-colors";

  return (
    <div className="gap-v1-structural-content-none p-v1-structural-content-micro bg-v1-context-menu-background-primary border-v1-border-structural-subtle rounded-v1-pill flex size-fit flex-row border shadow-[0px_1px_3px_0px_rgba(1,4,7,0.08),0px_1px_3px_0px_rgba(1,4,7,0.12)]">
      <div className="flex size-fit flex-row flex-wrap">
        <div className="gap-v1-structural-component-micro p-v1-structural-component-none flex size-fit flex-row flex-wrap items-end">
          <SuiteTooltip content="Select" sideOffset={TOOLTIP_SIDE_OFFSET}>
            <button
              className={`${iconButtonBase} ${
                selectActive
                  ? "bg-v1-surface-overlay-interactive-selected text-v1-action-icon-primary"
                  : "hover:bg-v1-surface-overlay-interactive-hover"
              }`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSetMode(STUDIO_MODE.select)}
              aria-label="Select"
              aria-pressed={selectActive}
            >
              <PointerIcon className="text-v1-action-icon-secondary size-6" />
            </button>
          </SuiteTooltip>

          <SuiteTooltip content="Hand tool" sideOffset={TOOLTIP_SIDE_OFFSET}>
            <button
              className={`${iconButtonBase} ${
                dragActive
                  ? "bg-v1-surface-overlay-interactive-selected text-v1-action-icon-primary"
                  : "hover:bg-v1-surface-overlay-interactive-hover"
              }`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSetMode(STUDIO_MODE.drag)}
              aria-label="Hand tool"
              aria-pressed={dragActive}
            >
              <HandIcon className="text-v1-action-icon-secondary size-6" />
            </button>
          </SuiteTooltip>

          <SuiteTooltip content="Mark" sideOffset={TOOLTIP_SIDE_OFFSET}>
            <button
              className={`${iconButtonBase} ${
                drawActive
                  ? "bg-v1-surface-overlay-interactive-selected text-v1-action-icon-primary"
                  : "hover:bg-v1-surface-overlay-interactive-hover"
              }`}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSetMode(STUDIO_MODE.draw)}
              aria-label="Mark"
              aria-pressed={drawActive}
            >
              <SquareDashedMousePointerIcon className="text-v1-action-icon-secondary size-6" />
            </button>
          </SuiteTooltip>
        </div>
      </div>
    </div>
  );
}
