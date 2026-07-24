import Image from "next/image";
import { Popover } from "radix-ui";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { compositeStyles } from "@/utils/commons/styles";

import type { TImageLimitAlertProps } from "./types";

const ImageLimitAlert = ({
  className = "",
  title,
  description,
  imageUrl,
  children,
  open,
  side = "right",
  onOpenChange,
  onClose,
}: TImageLimitAlertProps) => (
  <Popover.Root open={open} onOpenChange={onOpenChange}>
    <Popover.Trigger asChild>{children}</Popover.Trigger>
    <Popover.Portal>
      <Popover.Content
        className="relative z-50"
        sideOffset={5}
        side={side}
        onInteractOutside={() => onClose?.()}
      >
        <div
          className={compositeStyles(
            "rounded-rounded bg-icon-general-secondary p-small-0.25 flex max-w-[262px]",
            className
          )}
        >
          {imageUrl && (
            <Image
              className="rounded-soft"
              src={imageUrl}
              alt={title}
              width={64}
              height={64}
            />
          )}
          <div className="p-small-1 flex flex-col">
            <div className="flex items-center justify-between">
              <h4 className="text-footnoteM-bold text-text-general-inverse truncate">
                {title}
              </h4>
              {onClose && (
                <Popover.Close aria-label="Close" onClick={onClose}>
                  <SVGIcon
                    src="/icons/close.svg"
                    className="text-text-general-inverse"
                    width={10}
                    height={10}
                  />
                </Popover.Close>
              )}
            </div>
            <p className="text-footnoteS-neutral text-text-general-inverse line-clamp-2">
              {description}
            </p>
          </div>
        </div>

        <Popover.Arrow className="fill-white" />
      </Popover.Content>
    </Popover.Portal>
  </Popover.Root>
);

export default ImageLimitAlert;
