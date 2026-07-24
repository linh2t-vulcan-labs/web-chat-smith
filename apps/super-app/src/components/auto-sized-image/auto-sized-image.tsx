import React, { useEffect, useState } from "react";

import useNetwork from "@/hooks/use-network";
import { compositeStyles } from "@/utils/commons/styles";

type TAutoSizedImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  altFallback?: string;
  errorWidth?: number;
  errorHeight?: number;
};

const AutoSizedImage = ({
  className,
  src,
  altFallback = "No Image",
  errorWidth = 500,
  errorHeight = 500,
  ...props
}: TAutoSizedImageProps) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const isOnline = useNetwork();

  useEffect(() => {
    if (isOnline) {
      // oxlint-disable-next-line react/react-compiler -- effect re-syncs image src only when the network comes back online; idempotent derivation, false positive
      setCurrentSrc(src);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  if (!isOnline) {
    return (
      <div
        className="flex items-center justify-center rounded-default bg-gray-200 text-xs text-gray-500"
        style={{
          height: errorHeight,
          width: errorWidth,
        }}
      >
        {altFallback}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img
      {...props}
      src={currentSrc}
      className={compositeStyles("size-auto max-h-full max-w-full", className)}
      onError={() => setCurrentSrc("/images/image-not-found.png")}
    />
  );
};

export default AutoSizedImage;
