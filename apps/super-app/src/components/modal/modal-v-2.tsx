import { Dialog, VisuallyHidden } from "radix-ui";
import type { CSSProperties } from "react";
import { forwardRef, useMemo } from "react";

import { Z_INDEX_RANGES } from "@/config/z-index";
import { useZIndex } from "@/libs/z-index-manager/hooks/use-z-index";
import { compositeStyles } from "@/utils/commons/styles";

import type { TSubscriptionModal } from "./types";

const gapsModal = "max-h-[calc(100dvh-80px)] max-w-[calc(100vw-40px)]";
const centeredModal =
  "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";
const styledModal =
  "bg-surface-general-tertiary rounded-default focus:outline-hidden";

const ModalV2 = forwardRef<HTMLDivElement, TSubscriptionModal>((props, ref) => {
  const {
    className = "",
    containerClassName = " ",
    overlayClassName = "",
    centered = true,
    open,
    onClose,
    children,
    width,
    zIndex: zIndexProp = 99,
    isPreventClickOutside,
    dialogContentProps,
  } = props;

  // Determine priority based on zIndex ranges to preserve backward compatibility
  const priority = useMemo(() => {
    if (zIndexProp >= Z_INDEX_RANGES.MODAL_CRITICAL.min) {
      return "critical";
    }
    if (zIndexProp >= Z_INDEX_RANGES.MODAL_HIGH.min) {
      return "high";
    }
    return "normal";
  }, [zIndexProp]);

  // Use z-index manager when modal is open, fallback to prop for backward compatibility
  const managedZIndex = useZIndex({
    baseZIndex: zIndexProp,
    enabled: open,
    priority,
    type: "modal",
  });

  // Use managed z-index if modal is open, otherwise use prop (for backward compatibility)
  const zIndex = open ? managedZIndex : zIndexProp;

  const avoidDefaultDomBehavior = (e: Event) => {
    if (isPreventClickOutside) {
      e.preventDefault();
    }
  };

  const dialogStyleOverride = dialogContentProps?.style;
  const overlayZIndex = zIndex;
  const mergedContentStyle: CSSProperties = {
    ...dialogStyleOverride,
    ...(width ? { maxWidth: `${width}px` } : {}),
    zIndex,
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={compositeStyles(
            "bg-surface-general-modal2 fixed inset-0",
            overlayClassName
          )}
          style={{ zIndex: overlayZIndex }}
        />
        <Dialog.DialogContent
          aria-describedby={undefined}
          onPointerDownOutside={avoidDefaultDomBehavior}
          onInteractOutside={avoidDefaultDomBehavior}
          className={compositeStyles(
            gapsModal,
            centered ? centeredModal : "absolute left-1/2 -translate-x-1/2",
            styledModal,
            containerClassName
          )}
          // Prevent propagation to avoid triggering any underlying drag and drop handlers
          onDragOver={(e) => e.stopPropagation()}
          onDrop={(e) => e.stopPropagation()}
          {...dialogContentProps}
          style={mergedContentStyle}
        >
          <VisuallyHidden.Root asChild>
            <Dialog.Title>Title</Dialog.Title>
          </VisuallyHidden.Root>

          {/* <div
            className={compositeStyles(
              `z-[${zIndex}]`,
              gapsModal,
              centeredModal,
              styledModal,
              containerClassName
            )}
          > */}
          <div ref={ref} className={compositeStyles("p-medium-2.5", className)}>
            {children}
          </div>
          {/* </div> */}
        </Dialog.DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
});

ModalV2.displayName = "ModalV2";

export default ModalV2;
