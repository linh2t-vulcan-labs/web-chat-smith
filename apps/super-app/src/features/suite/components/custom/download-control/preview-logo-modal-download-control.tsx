"use client";

import DownloadIcon from "@/features/suite/assets/icons/download-icon.svg";
import { Button } from "@/features/suite/components/ui/button";

export interface DownloadOption<TFormat extends string = string> {
  value: TFormat;
  label: string;
}

export interface PreviewLogoModalDownloadControlProps<
  TFormat extends string = string,
> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  options: readonly DownloadOption<TFormat>[];
  onSelect?: (format: TFormat) => void;
}

export function PreviewLogoModalDownloadControl<TFormat extends string>({
  open,
  onOpenChange,
  options,
  onSelect,
}: PreviewLogoModalDownloadControlProps<TFormat>) {
  return (
    <div className="p-v1-structural-content-micro rounded-e-v1-pill border-v1-border-structural-default relative flex flex-row items-center border-s">
      <Button
        aria-label="Download"
        variant="ghost"
        className="rounded-v1-pill p-v1-structural-component-micro text-v1-action-text-secondary h-10 gap-2 overflow-hidden px-2"
        onClick={() => onOpenChange(!open)}
        type="button"
      >
        <span className="text-functional-scale-2 font-normal capitalize">
          Download
        </span>
        <span className="rounded-v1-pill hover:rounded-v1-circle hover:bg-v1-surface-overlay-interactive-hover flex size-6 items-center justify-center">
          <DownloadIcon className="text-v1-action-icon-secondary size-6" />
        </span>
      </Button>

      {open && (
        <PreviewLogoModalDownloadMenu
          options={options}
          onOpenChange={onOpenChange}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}

function PreviewLogoModalDownloadMenu<TFormat extends string>({
  options,
  onOpenChange,
  onSelect,
}: Pick<
  PreviewLogoModalDownloadControlProps<TFormat>,
  "options" | "onOpenChange" | "onSelect"
>) {
  return (
    <div className="border-v1-border-structural-soften bg-v1-surface-hierarchy-raised p-v1-structural-content-micro mt-v1-1 gap-v1-structural-content-none rounded-v1-large absolute inset-e-0 bottom-full mb-1 flex size-fit flex-row border">
      <div className="flex min-w-30.5 flex-col">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onOpenChange(false);
              onSelect?.(option.value);
            }}
            className="rounded-v1-pill px-v1-structural-content-tight py-v1-optical-normal text-functional-scale-1 text-v1-text-hierarchy-primary hover:bg-v1-surface-overlay-interactive-hover flex cursor-pointer items-center overflow-hidden border-none bg-transparent text-start leading-5 transition-colors"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
