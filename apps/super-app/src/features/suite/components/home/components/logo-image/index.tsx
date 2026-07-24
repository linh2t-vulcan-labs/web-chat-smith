"use client";

import Image from "next/image";

import { SuiteImageSkeleton } from "@/features/suite/components/custom/suite-image-skeleton";
import { useImageLoad } from "@/features/suite/hooks/use-image-load";
import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

export interface LogoImageProps {
  src?: string;
  alt: string;
  width: number;
  height?: number;
  className?: string;
}

// Stable key while the slot is empty (no src yet) so the load state survives a later src arrival.
const PLACEHOLDER_KEY = "empty";

export function LogoImage({
  src,
  alt,
  width,
  height,
  className,
}: LogoImageProps) {
  const key = src ?? PLACEHOLDER_KEY;
  const { getImageLoadState, handleImageError, handleImageLoad } = useImageLoad(
    [key]
  );
  const imageLoad = getImageLoadState(key, { shouldLoad: !!src });
  const showGlass = !src || imageLoad.isError;

  return (
    <div
      data-testid={DATA_TEST_ID.suite.home.logoImage}
      className={cn(
        "group relative w-full overflow-hidden",
        imageLoad.isLoaded && "bg-v1-surface-hierarchy-container",
        className
      )}
      style={height === null || height === undefined ? undefined : { height }}
    >
      {showGlass ? (
        <div className="bg-v1-surface-glass-dark-breath size-full" />
      ) : (
        <>
          {!imageLoad.isLoaded && (
            <SuiteImageSkeleton className="absolute inset-0 size-full" />
          )}
          <Image
            src={src}
            alt={alt}
            fill
            sizes={`${width}px`}
            className={cn(
              "object-cover transition duration-300 group-hover:scale-110",
              imageLoad.isLoaded ? "opacity-100" : "opacity-0"
            )}
            onError={() => handleImageError(key)}
            onLoad={() => handleImageLoad(key)}
          />
        </>
      )}
    </div>
  );
}
