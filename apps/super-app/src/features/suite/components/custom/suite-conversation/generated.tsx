"use client";

import Image from "next/image";
import { useState } from "react";

import { useImageLoad } from "@/features/suite/hooks/use-image-load";
import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";
import { downloadImageFromUrl } from "@/features/suite/utils/download-image";

import { PreviewLogoModal } from "../preview-logo-modal/index";
import { ImageInputError } from "../prompt-input/image-input-error";
import { SuiteImageSkeleton } from "../suite-image-skeleton";
import type { SuiteGeneratedProps } from "./types";

export function SuiteGenerated({
  title,
  images,
  className,
}: SuiteGeneratedProps) {
  // Stable per-slot key: real src once delivered, placeholder while the slot is still empty.
  const imageKeys = images.map((src, i) => src ?? `empty-${i}`);
  const { getImageLoadState, handleImageError, handleImageLoad } =
    useImageLoad(imageKeys);
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  return (
    <>
      <div
        data-testid={DATA_TEST_ID.suite.custom.suiteGenerated}
        className={cn(
          "gap-v1-structural-content-normal flex h-fit flex-col self-stretch",
          className
        )}
      >
        <span className="typo-v1-markdown-h4 text-v1-text-hierarchy-primary h-fit self-stretch font-semibold capitalize">
          {title}
        </span>
        <div className="gap-v1-structural-content-tight grid grid-cols-1 self-stretch sm:grid-cols-2 lg:grid-cols-3">
          {images.map((src, i) => {
            const key = src ?? `empty-${i}`;
            const imageLoad = getImageLoadState(key, { shouldLoad: !!src });
            return (
              <button
                key={i}
                type="button"
                disabled={!src || imageLoad.isError}
                className={cn(
                  "after:bg-v1-surface-overlay-scrim-light relative aspect-square w-full cursor-pointer overflow-hidden rounded-[6px] after:absolute after:inset-0 after:opacity-0 after:transition-opacity after:duration-300 hover:after:opacity-100 disabled:cursor-default",
                  imageLoad.isLoaded &&
                    !imageLoad.isError &&
                    "border-v1-border-structural-default border border-solid"
                )}
                onClick={() => src && !imageLoad.isError && setPreviewSrc(src)}
              >
                {imageLoad.isError ? (
                  <ImageInputError
                    className="absolute inset-0 size-full"
                    alertIconSize="size-12"
                    alertIconWidth={36}
                    alertIconHeight={36}
                  />
                ) : (
                  (!src || !imageLoad.isLoaded) && (
                    <SuiteImageSkeleton className="absolute inset-0" />
                  )
                )}
                {src && !imageLoad.isError && (
                  <Image
                    src={src}
                    alt="Generated image"
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className={cn(
                      "object-cover transition-opacity duration-300",
                      imageLoad.isLoaded ? "opacity-100" : "opacity-0"
                    )}
                    onError={() => handleImageError(key)}
                    onLoad={() => handleImageLoad(key)}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <PreviewLogoModal
        open={previewSrc !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewSrc(null);
          }
        }}
        src={previewSrc ?? ""}
        onDownload={(fmt) => {
          if (previewSrc) {
            downloadImageFromUrl(previewSrc, fmt);
          }
        }}
      />
    </>
  );
}
