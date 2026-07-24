"use client";

import type { ImageProps } from "next/image";
import Image from "next/image";
import { useEffect, useState } from "react";

import useNetwork from "@/hooks/use-network";

type ImageWithFallbackProps = ImageProps & {
  fallbackSrc?: string;
  altFallback?: string;
};

export default function ImageWithFallback({
  src,
  fallbackSrc = "/images/image-not-found.png",
  alt,
  altFallback = "N/A",
  ...props
}: ImageWithFallbackProps) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const isOnline = useNetwork();

  useEffect(() => {
    if (isOnline) {
      // oxlint-disable-next-line react/react-compiler -- effect re-syncs image src only when the network comes back online; idempotent derivation, false positive
      setCurrentSrc(src);
    }
  }, [src, isOnline]);

  if (!isOnline) {
    return (
      <div
        className="flex size-full items-center justify-center rounded-sm bg-gray-200 text-xs text-gray-500"
        style={{
          height: props.height,
          width: props.width,
        }}
      >
        {altFallback}
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={currentSrc}
      alt={alt}
      onError={() => setCurrentSrc(fallbackSrc)}
    />
  );
}
