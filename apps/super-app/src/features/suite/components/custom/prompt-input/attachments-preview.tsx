"use client";

import Image from "next/image";

import {
  Attachment,
  AttachmentRemove,
} from "@/features/suite/components/ui/ai-elements/attachments";
import { usePromptInputAttachments } from "@/features/suite/components/ui/ai-elements/prompt-input";
import { Skeleton } from "@/features/suite/components/ui/skeleton";
import { useImageLoad } from "@/features/suite/hooks/use-image-load";
import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

import { ImageInputError } from "./image-input-error";

export function PromptInputAttachmentsPreview() {
  const attachments = usePromptInputAttachments();
  const imageKeys = attachments.files.map((file) => file.id);
  const { getImageLoadState, handleImageError, handleImageLoad } =
    useImageLoad(imageKeys);

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <div
      data-testid={DATA_TEST_ID.suite.custom.promptInputAttachmentsPreview}
      className="px-v1-structural-content-tight py-v1-optical-normal relative z-10 overflow-hidden"
    >
      <div className="gap-v1-structural-content-tight flex items-center overflow-hidden">
        {attachments.files.map((file) => {
          const hasPreviewUrl = !!file.url && file.uploadStatus !== "uploading";
          // Local previews (blob:/data:) can't go through the /_next/image optimizer, so
          // they stay raw. Remote URLs MUST be optimized: loading them raw collides with
          // the canvas, which loads the same URL via img.crossOrigin="anonymous" — two
          // cache entries under different CORS modes → ERR_CACHE_READ_FAILURE.
          const isLocalPreviewUrl =
            file.url?.startsWith("blob:") || file.url?.startsWith("data:");
          const imageLoad = getImageLoadState(file.id, {
            hasExternalError:
              file.uploadStatus === "failed" ||
              (file.uploadStatus === "completed" && !file.url),
            shouldLoad: hasPreviewUrl,
          });
          // Canvas attachment numbering is intentionally disabled for now.
          // Keep this logic here because the numbered badge may come back later.
          // const canvasIndex = attachments.files
          //   .filter((attachment) => attachment.source === "canvas")
          //   .findIndex((attachment) => attachment.id === file.id);
          return (
            <Attachment
              className="relative size-13"
              data={file}
              key={file.id}
              onRemove={() => attachments.remove(file.id)}
            >
              {imageLoad.isError ? (
                <ImageInputError className="absolute inset-0" />
              ) : (
                imageLoad.isLoading && (
                  <Skeleton className="rounded-v1-medium absolute inset-0 size-full" />
                )
              )}
              {hasPreviewUrl && !imageLoad.isError && (
                <Image
                  alt={file.filename ?? "Image"}
                  className={cn(
                    "rounded-v1-300 size-full overflow-hidden object-cover transition-opacity duration-300",
                    imageLoad.isLoaded ? "opacity-100" : "opacity-0"
                  )}
                  height={52}
                  src={file.url}
                  unoptimized={isLocalPreviewUrl}
                  width={52}
                  onError={() => handleImageError(file.id)}
                  onLoad={() => handleImageLoad(file.id)}
                />
              )}
              {file.removable !== false && (
                <AttachmentRemove className="end-v1-optical-subtle top-v1-optical-subtle end-v1-optical-subtle rounded-v1-pill bg-v1-action-background-secondary text-v1-action-icon-tertiary size-5 cursor-pointer opacity-100 [&>svg]:size-4" />
              )}
              {/*
                Canvas attachment numbering is intentionally disabled for now.
                Keep this badge block here because product may bring it back later.
                {canvasIndex >= 0 && (
                  <div
                    className="bottom-v1-structural-content-micro start-v1-structural-content-micro rounded-v1-pill px-v1-structural-content-micro py-v1-optical-subtle absolute inline-flex h-4 min-w-5 items-center justify-center border text-[10px] leading-3 font-medium"
                    style={{
                      backgroundColor: "#0066ff",
                      borderColor: "#4294ff",
                      color: "#fafafa",
                    }}
                  >
                    {canvasIndex + 1}
                  </div>
                )}
              */}
            </Attachment>
          );
        })}
      </div>
    </div>
  );
}
