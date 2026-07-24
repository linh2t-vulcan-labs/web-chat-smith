import type { ImageProps } from "next/image";

export interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
  fallbackAlt?: string;
  showFallbackOnError?: boolean;
}
