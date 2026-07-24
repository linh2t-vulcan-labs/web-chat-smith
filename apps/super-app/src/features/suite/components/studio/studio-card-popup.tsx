"use client";

import { useState } from "react";

import MessageCircleIcon from "@/features/suite/assets/icons/chat-icon.svg";
import DownloadIcon from "@/features/suite/assets/icons/download-icon.svg";

interface StudioCardPopupProps {
  pos: { x: number; y: number };
  isAddedToChat: boolean;
  onInteract: () => void;
  onAddToChat: () => void;
  onDownload: (format: "png" | "jpg" | "svg") => void;
}

export function StudioCardPopup({
  pos,
  isAddedToChat,
  onInteract,
  onAddToChat,
  onDownload,
}: StudioCardPopupProps) {
  const [dlMenuOpen, setDlMenuOpen] = useState(false);

  return (
    <div
      role="presentation"
      style={{
        insetInlineStart: pos.x,
        top: pos.y,
        transform: "translate(-50%, calc(-100% - 12px))",
      }}
      onClick={onInteract}
      className="fixed z-30 cursor-default bg-transparent p-0 text-start"
    >
      {/* Pill row — SuiteC/contexual-menu */}
      <div className="rounded-v1-pill border-v1-border-structural-soften bg-v1-surface-hierarchy-raised gap-v1-structural-content-none flex size-fit items-center border">
        {/* Left: Add To Chat — icon + text ghost button */}
        <div className="p-v1-structural-content-micro">
          <button
            type="button"
            disabled={isAddedToChat}
            onClick={onAddToChat}
            className="rounded-v1-pill p-v1-structural-component-micro hover:bg-v1-surface-overlay-interactive-hover disabled:opacity-v1-de-emphasis flex cursor-pointer items-center justify-center overflow-hidden transition-colors disabled:pointer-events-none"
          >
            <MessageCircleIcon
              className="text-v1-action-icon-secondary size-6 shrink-0"
              strokeWidth={1.25}
            />
            <span className="px-v1-structural-content-micro py-v1-optical-subtle text-functional-scale-2 text-v1-action-text-secondary leading-5 whitespace-nowrap capitalize">
              Add To Chat
            </span>
          </button>
        </div>

        {/* Right: Download icon button — separated by border-start */}
        <div className="border-v1-border-structural-default p-v1-structural-content-micro border-s">
          <button
            type="button"
            onClick={() => setDlMenuOpen((v) => !v)}
            className="rounded-v1-pill p-v1-structural-component-micro text-v1-action-icon-secondary hover:bg-v1-surface-overlay-interactive-hover flex cursor-pointer items-center justify-center overflow-hidden transition-colors"
            title="Download"
          >
            <DownloadIcon className="size-6" strokeWidth={1.25} />
          </button>
        </div>
      </div>

      {/* Download sub-menu — SuiteC_dropdown-list, positioned below pill */}
      {dlMenuOpen && (
        <div className="border-v1-border-structural-soften bg-v1-surface-hierarchy-raised p-v1-structural-content-micro mt-v1-1 gap-v1-structural-content-none rounded-v1-large absolute inset-e-0 top-full flex size-fit flex-row border">
          <div className="flex size-fit flex-col">
            {(["png", "jpg"] as const).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => {
                  setDlMenuOpen(false);
                  onDownload(fmt);
                }}
                className="rounded-v1-pill px-v1-structural-content-tight py-v1-optical-normal text-functional-scale-1 text-v1-text-hierarchy-primary hover:bg-v1-surface-overlay-interactive-hover gap-v1-structural-content-none flex size-fit cursor-pointer items-center overflow-hidden border-none bg-transparent text-start leading-5 transition-colors"
              >
                Download .{fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
