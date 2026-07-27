import type { Experimental_GeneratedImage } from "ai";

import { cn } from "#lib/utils";

export type ImageProps = Experimental_GeneratedImage & {
  className?: string;
  alt?: string;
};

export const Image = ({
  base64,
  uint8Array: _uint8Array,
  mediaType,
  ...props
}: ImageProps) => (
  // oxlint-disable-next-line next/no-img-element -- generated image is a base64 data URI with unknown dimensions, not a next/image-optimizable remote asset
  <img
    {...props}
    alt={props.alt}
    className={cn(
      "h-auto max-w-full overflow-hidden rounded-md",
      props.className
    )}
    src={`data:${mediaType};base64,${base64}`}
  />
);
