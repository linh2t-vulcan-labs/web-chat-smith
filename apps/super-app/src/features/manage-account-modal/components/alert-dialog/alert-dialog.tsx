"use client";

import { AlertDialog as AlertDialogPrimitive, VisuallyHidden } from "radix-ui";
import type { JSX, ReactNode } from "react";
import { forwardRef, useMemo } from "react";

import {
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter as AlertDialogFooterPrimitive,
  AlertDialogHeader as AlertDialogHeaderPrimitive,
  AlertDialog as AlertDialogRoot,
  AlertDialogTitle,
} from "@/components/alert-dialog";
import { Button } from "@/components/button-ds";
import { SvgIcon } from "@/components/svg-icon-ds";
import { cn } from "@/components/utils/cn";
import { Z_INDEX_RANGES } from "@/config/z-index";
import { useZIndex } from "@/libs/z-index-manager/hooks/use-z-index";

import type {
  TAlertDialogFooterConfig,
  TAlertDialogHeader,
  TAlertDialogProps,
} from "./types";

function AlertDialogHeader({
  title,
  showCloseIcon = true,
  closeIcon,
  onClose,
  className,
}: TAlertDialogHeader & { className?: string }): JSX.Element | null {
  if (!title && !showCloseIcon) {
    return null;
  }

  return (
    <AlertDialogHeaderPrimitive
      className={cn("px-v1-structural-component-large", className)}
    >
      {title && <AlertDialogTitle>{title}</AlertDialogTitle>}
      {showCloseIcon && onClose && (
        <Button.Micro onClick={onClose} type="utility">
          {closeIcon || <SvgIcon name="x" size={16} />}
        </Button.Micro>
      )}
    </AlertDialogHeaderPrimitive>
  );
}

function AlertDialogFooter({
  cancel,
  action,
  className,
  justify,
  direction,
}: TAlertDialogFooterConfig): JSX.Element {
  const renderCancel = (): ReactNode => {
    if (!cancel) {
      return null;
    }

    const btn = (
      <Button
        variant={cancel.variant ?? "utility"}
        size="l"
        disabled={cancel.disabled}
        className={cancel.className}
        // oxlint-disable-next-line react/jsx-handler-names -- forwarded from the cancel config object, not a local handler
        onClick={cancel.onClick}
      >
        {cancel.label}
      </Button>
    );

    if (cancel.preventAutoClose) {
      return btn;
    }
    return (
      <AlertDialogPrimitive.Cancel asChild>{btn}</AlertDialogPrimitive.Cancel>
    );
  };

  return (
    <AlertDialogFooterPrimitive
      className={className}
      justify={justify}
      direction={direction}
    >
      {renderCancel()}
      {action && (
        <AlertDialogPrimitive.Action asChild>
          <Button
            variant={action.variant ?? "primary"}
            size="l"
            disabled={action.disabled}
            className={action.className}
            // oxlint-disable-next-line react/jsx-handler-names -- forwarded from the action config object, not a local handler
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </AlertDialogPrimitive.Action>
      )}
    </AlertDialogFooterPrimitive>
  );
}

const AlertDialog = forwardRef<HTMLDivElement, TAlertDialogProps>(
  (
    {
      open,
      onOpenChange,
      children,
      header,
      body,
      footer,
      className,
      overlayClassName,
      zIndex: zIndexProp = 99,
      size = "md",
      preventCloseOnOutsideClick = false,
    },
    ref
  ) => {
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

    const handleOpenChange = (next: boolean): void => {
      if (!preventCloseOnOutsideClick || next) {
        onOpenChange?.(next);
      }
    };

    const renderFooter = (): ReactNode => {
      if (!footer) {
        return null;
      }

      if (
        typeof footer === "object" &&
        !("$$typeof" in (footer as object)) &&
        ("cancel" in (footer as object) || "action" in (footer as object))
      ) {
        return <AlertDialogFooter {...(footer as TAlertDialogFooterConfig)} />;
      }

      return (
        <AlertDialogFooterPrimitive>
          {footer as ReactNode}
        </AlertDialogFooterPrimitive>
      );
    };

    return (
      <AlertDialogRoot open={open} onOpenChange={handleOpenChange}>
        <AlertDialogContent
          ref={ref}
          size={size}
          zIndex={zIndex}
          overlayClassName={overlayClassName}
          className={className}
          onEscapeKeyDown={(e) => {
            if (preventCloseOnOutsideClick) {
              e.preventDefault();
            }
          }}
        >
          {!header?.title && (
            <VisuallyHidden.Root asChild>
              <AlertDialogPrimitive.Title>Alert</AlertDialogPrimitive.Title>
            </VisuallyHidden.Root>
          )}

          {header && <AlertDialogHeader {...header} />}

          <AlertDialogBody spacing={body?.spacing} className={body?.className}>
            {children}
          </AlertDialogBody>

          {renderFooter()}
        </AlertDialogContent>
      </AlertDialogRoot>
    );
  }
);
AlertDialog.displayName = "AlertDialog";

export default AlertDialog;
export { AlertDialogHeader, AlertDialogFooter };
