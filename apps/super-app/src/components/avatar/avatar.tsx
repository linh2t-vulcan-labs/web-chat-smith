import { getImageProps } from "next/image";
import { Avatar as AvatarPrimitive } from "radix-ui";

import { compositeStyles } from "@/utils/commons/styles";

import { avatarStyles } from "./consts";
import type { TAvatarProps } from "./types";
import { stringAvatar } from "./utils";

export default function Avatar({
  imageURL,
  alt: _alt,
  children,
  size = "small",
  color = "bg-surface-system-neutral",
  className,
  subItem,
}: Readonly<TAvatarProps>) {
  const { props: imageProps } = imageURL
    ? getImageProps({ alt: "avatar", fill: true, src: imageURL })
    : { props: null };
  const styles = avatarStyles(size);
  const borderClassName = imageURL ? "" : "border-[#666666] border";

  return (
    <div className="relative inline-flex">
      <AvatarPrimitive.Root
        className={compositeStyles([
          styles.tailwindSize,
          borderClassName,
          styles.fontSize,
          "flex items-center justify-center overflow-hidden rounded-full font-medium text-white uppercase",
          color,
          className,
        ])}
      >
        {imageURL && (
          <AvatarPrimitive.Image
            className="size-full rounded-full object-cover"
            {...imageProps}
          />
        )}
        {children && (
          <AvatarPrimitive.Fallback
            delayMs={600}
            className={compositeStyles([
              "flex size-full items-center justify-center",
              styles.fontSize,
              color,
            ])}
          >
            {stringAvatar(children)}
          </AvatarPrimitive.Fallback>
        )}
      </AvatarPrimitive.Root>
      {subItem}
    </div>
  );
}
