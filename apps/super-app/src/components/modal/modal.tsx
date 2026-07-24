"use client";

import { Dialog, VisuallyHidden } from "radix-ui";
import type { CSSProperties } from "react";
import { forwardRef, useMemo } from "react";

import { cn } from "@/components/utils/cn";
import { Z_INDEX_RANGES } from "@/config/z-index";
import { useZIndex } from "@/libs/z-index-manager/hooks/use-z-index";

import {
  dialogContentVariants,
  dialogOverlayVariants,
} from "../dialog/dialog-variants";
import type { TModalProps } from "./types";

const Modal = forwardRef<HTMLDivElement, TModalProps>((props, _ref) => {
  const {
    open,
    onClose,
    children,
    containerClassName,
    overlayClassName,
    zIndex: zIndexProp = 99,
    size = "md",
    width,
    centered = true,
    isPreventClickOutside = false,
  } = props;

  const priority = useMemo(() => {
    if (zIndexProp >= Z_INDEX_RANGES.MODAL_CRITICAL.min) {
      return "critical";
    }
    if (zIndexProp >= Z_INDEX_RANGES.MODAL_HIGH.min) {
      return "high";
    }
    return "normal";
  }, [zIndexProp]);

  const managedZIndex = useZIndex({
    baseZIndex: zIndexProp,
    enabled: open,
    priority,
    type: "modal",
  });

  const zIndex = open ? managedZIndex : zIndexProp;

  const avoidDefault = (e: Event): void => {
    if (isPreventClickOutside) {
      e.preventDefault();
    }
  };

  const contentStyle: CSSProperties = {
    zIndex,
    ...(width ? { maxWidth: `${width}px` } : {}),
    // override vertical positioning when not centered
    ...(centered ? {} : { top: "0", transform: "translateX(-50%)" }),
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(dialogOverlayVariants(), overlayClassName)}
          style={{ zIndex }}
        />
        <Dialog.Content
          aria-describedby={undefined}
          onPointerDownOutside={avoidDefault}
          onInteractOutside={avoidDefault}
          onDragOver={(e) => e.stopPropagation()}
          onDrop={(e) => e.stopPropagation()}
          className={cn(
            dialogContentVariants({ size }),
            !centered && "top-0 translate-y-0",
            containerClassName
          )}
          style={contentStyle}
        >
          <VisuallyHidden.Root asChild>
            <Dialog.Title>Dialog</Dialog.Title>
          </VisuallyHidden.Root>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

Modal.displayName = "Modal";

export default Modal;
