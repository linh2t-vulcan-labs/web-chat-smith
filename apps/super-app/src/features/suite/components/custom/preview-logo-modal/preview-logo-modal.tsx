"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import Image from "next/image";
import { useEffect, useState } from "react";

import MinusIcon from "@/features/suite/assets/icons/download-modal/minus-icon.svg";
import PlusIcon from "@/features/suite/assets/icons/download-modal/plus-icon.svg";
import XIcon from "@/features/suite/assets/icons/x-icon.svg";
import { PreviewLogoModalDownloadControl } from "@/features/suite/components/custom/download-control";
import type { DownloadOption } from "@/features/suite/components/custom/download-control";
import { Button } from "@/features/suite/components/ui/button";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/features/suite/components/ui/dialog";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

type PreviewLogoDownloadFormat = "png" | "jpg";

const PREVIEW_LOGO_DOWNLOAD_OPTIONS = [
  { label: "Download .PNG", value: "png" },
  { label: "Download .JPG", value: "jpg" },
] satisfies DownloadOption<PreviewLogoDownloadFormat>[];

export interface PreviewLogoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt?: string;
  onDownload?: (format: PreviewLogoDownloadFormat) => void;
}

interface PreviewLogoModalRootProps {
  children: React.ReactNode;
}

interface PreviewLogoModalCloseButtonProps {
  onClick: () => void;
}

interface PreviewLogoModalImageProps {
  src: string;
  alt: string;
  scale: number;
}

interface PreviewLogoModalToolbarProps {
  children: React.ReactNode;
}

interface PreviewLogoModalZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export function PreviewLogoModal({
  open,
  onOpenChange,
  src,
  alt = "Logo preview",
  onDownload,
}: PreviewLogoModalProps) {
  const [scale, setScale] = useState(1);
  const [dlMenuOpen, setDlMenuOpen] = useState(false);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.1, 4));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.1, 0.1));

  // Reset zoom when modal closes
  useEffect(() => {
    if (!open) {
      // oxlint-disable-next-line react/react-compiler -- resets zoom/menu state when the modal closes, syncing with the open prop transition, not a render derivation
      setScale(1);
      setDlMenuOpen(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-v1-surface-overlay-emphasis-blocking backdrop-blur-none" />

        <PreviewLogoModalRoot>
          <DialogTitle className="sr-only">{alt}</DialogTitle>

          <PreviewLogoModalCloseButton onClick={() => onOpenChange(false)} />

          <PreviewLogoModalImage src={src} alt={alt} scale={scale} />

          <PreviewLogoModalToolbar>
            <PreviewLogoModalZoomControls
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
            />
            <PreviewLogoModalDownloadControl
              open={dlMenuOpen}
              onOpenChange={setDlMenuOpen}
              options={PREVIEW_LOGO_DOWNLOAD_OPTIONS}
              onSelect={onDownload}
            />
          </PreviewLogoModalToolbar>
        </PreviewLogoModalRoot>
      </DialogPortal>
    </Dialog>
  );
}

function PreviewLogoModalRoot({ children }: PreviewLogoModalRootProps) {
  return (
    <DialogPrimitive.Popup
      data-testid={DATA_TEST_ID.suite.custom.previewLogoModal}
      className="fixed inset-0 z-50 flex flex-col outline-none"
    >
      {children}
    </DialogPrimitive.Popup>
  );
}

function PreviewLogoModalCloseButton({
  onClick,
}: PreviewLogoModalCloseButtonProps) {
  return (
    <div className="end-v1-structural-content-relaxed top-v1-structural-content-relaxed absolute z-10">
      <Button
        aria-label="Close preview"
        variant="ghost"
        className="rounded-v1-circle bg-v1-action-background-secondary p-v1-structural-component-micro text-v1-icons-hierarchy-primary hover:before:bg-v1-surface-overlay-interactive-hover relative size-10 overflow-hidden before:pointer-events-none before:absolute before:inset-0 before:content-['']"
        onClick={onClick}
        type="button"
      >
        <XIcon className="text-v1-icons-hierarchy-primary size-6" />
      </Button>
    </div>
  );
}

function PreviewLogoModalImage({
  src,
  alt,
  scale,
}: PreviewLogoModalImageProps) {
  return (
    <div className="flex flex-1 items-center justify-center">
      <div
        className="p-v1-optical-subtle transition-transform duration-200"
        style={{ transform: `scale(${scale})` }}
      >
        <Image
          src={src || ""}
          alt={alt}
          width={476}
          height={476}
          className="block size-119 object-contain"
          draggable={false}
          unoptimized
        />
      </div>
    </div>
  );
}

function PreviewLogoModalToolbar({ children }: PreviewLogoModalToolbarProps) {
  return (
    <div className="py-v1-structural-content-relaxed flex shrink-0 items-center justify-center">
      <div className="bg-v1-surface-hierarchy-raised border-v1-border-structural-soften rounded-v1-pill z-30 flex flex-row border">
        {children}
      </div>
    </div>
  );
}

function PreviewLogoModalZoomControls({
  onZoomIn,
  onZoomOut,
}: PreviewLogoModalZoomControlsProps) {
  return (
    <div className="p-v1-structural-content-micro rounded-s-v1-pill flex flex-row items-center gap-0">
      <Button
        aria-label="Zoom in"
        variant="ghost"
        className="rounded-v1-pill p-v1-structural-component-micro text-v1-action-icon-secondary hover:rounded-v1-circle hover:bg-v1-surface-overlay-interactive-hover size-10 overflow-hidden"
        onClick={onZoomIn}
        type="button"
      >
        <PlusIcon className="text-v1-action-icon-secondary size-6" />
      </Button>
      <Button
        aria-label="Zoom out"
        variant="ghost"
        className="rounded-v1-pill p-v1-structural-component-micro text-v1-action-icon-secondary hover:rounded-v1-circle hover:bg-v1-surface-overlay-interactive-hover size-10 overflow-hidden"
        onClick={onZoomOut}
        type="button"
      >
        <MinusIcon className="text-v1-action-icon-secondary size-6" />
      </Button>
    </div>
  );
}
