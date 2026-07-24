"use client";

import type { StudioMode } from "./constants";
import { StudioToolbar } from "./studio-toolbar";
import { StudioZoomControl } from "./studio-zoom-control";

interface StudioBottomBarProps {
  zoom: number;
  mode: StudioMode;
  spacePanning: boolean;
  onSetMode: (mode: StudioMode) => void;
  onFit: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function StudioBottomBar({
  zoom,
  mode,
  spacePanning,
  onSetMode,
  onFit,
  onZoomIn,
  onZoomOut,
}: StudioBottomBarProps) {
  return (
    <div className="studio-bottom-bar pt-v1-structural-content-relaxed pb-v1-structural-content-relaxed gap-v1-structural-content-tight fixed start-0 end-0 bottom-0 z-30 flex w-auto flex-col items-center transition-[inset-inline-start] duration-200 ease-linear will-change-[inset-inline-start] md:grid md:grid-cols-[1fr_auto_1fr] md:gap-0">
      <div className="hidden md:block" />
      <StudioToolbar
        mode={mode}
        spacePanning={spacePanning}
        onSetMode={onSetMode}
      />
      <div className="z-30 flex items-center justify-center md:justify-end md:pe-4">
        <StudioZoomControl
          zoom={zoom}
          onZoomIn={onZoomIn}
          onZoomOut={onZoomOut}
          onFit={onFit}
        />
      </div>
    </div>
  );
}
