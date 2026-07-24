"use client";

import Image from "next/image";
import { useState } from "react";

import type { SafeImageProps } from "./types";

// Intentional no-op: avoid retriggering the error handler on the fallback image
function noop() {
  // no-op
}

export default function SafeImage({
  src,
  fallbackSrc = "/images/image-not-found.jpg",
  alt,
  fallbackAlt = "Image not found",
  showFallbackOnError = true,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  if (hasError && showFallbackOnError) {
    return (
      <Image {...props} src={fallbackSrc} alt={fallbackAlt} onError={noop} />
    );
  }

  return <Image {...props} src={src} alt={alt} onError={handleError} />;
}
