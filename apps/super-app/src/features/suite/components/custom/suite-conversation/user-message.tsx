"use client";

import { CircleAlert } from "lucide-react";
import Image from "next/image";

import {
  Message,
  MessageContent,
} from "@/features/suite/components/ui/ai-elements/message";
import { useImageLoad } from "@/features/suite/hooks/use-image-load";
import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

import { ImageInputError } from "../prompt-input/image-input-error";
import { SuiteImageSkeleton } from "../suite-image-skeleton";
import type { SuiteUserMessageProps } from "./types";

export function SuiteUserMessage({
  children,
  images,
  maxImages = 3,
  showFailed,
  className,
}: SuiteUserMessageProps) {
  const visibleImages = images?.slice(0, maxImages) ?? [];
  const imageKeys = visibleImages.map((src, index) => `${src}-${index}`);
  const { getImageStatus, handleImageError, handleImageLoad } =
    useImageLoad(imageKeys);

  return (
    <Message
      data-testid={DATA_TEST_ID.suite.custom.suiteUserMessage}
      className={cn(
        "gap-v1-structural-component-micro max-w-3xl items-end self-stretch",
        className
      )}
      from="user"
    >
      {visibleImages.length > 0 && (
        <div className="gap-v1-structural-content-tight flex h-fit w-full flex-row justify-end">
          {visibleImages.map((src, i) => {
            const imageKey = `${src}-${i}`;
            return (
              <div
                key={imageKey}
                className="rounded-v1-medium relative h-13 w-13 shrink-0 overflow-hidden"
              >
                {getImageStatus(imageKey) === "loading" && (
                  <SuiteImageSkeleton className="absolute inset-0" />
                )}
                {getImageStatus(imageKey) === "error" && (
                  <ImageInputError className="absolute inset-0" />
                )}
                {getImageStatus(imageKey) !== "error" && (
                  <Image
                    src={src}
                    alt=""
                    fill
                    className={cn(
                      "object-cover transition-opacity duration-300",
                      getImageStatus(imageKey) === "loaded"
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                    onError={() => handleImageError(imageKey)}
                    onLoad={() => handleImageLoad(imageKey)}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
      <MessageContent className="backdrop-blur-md">
        <p className="typo-v1-body-longform text-v1-text-hierarchy-primary font-250 wrap-break-word whitespace-pre-wrap">
          {children}
        </p>
      </MessageContent>
      {showFailed && (
        <div className="gap-v1-structural-content-micro px-v1-structural-content-micro flex h-5 w-fit flex-row items-center justify-end self-end">
          <CircleAlert className="text-v1-icons-status-error size-4 shrink-0" />
          <span className="typo-v1-action-sm-light text-v1-text-status-error font-250 capitalize">
            Sending failed
          </span>
        </div>
      )}
    </Message>
  );
}
