"use client";

import { AlertDialog as AlertDialogPrimitive } from "radix-ui";
import * as React from "react";
import type { VariantProps } from "tailwind-variants";

import { cn } from "@/components/utils/cn";

import {
  dialogBodyVariants,
  dialogContentVariants,
  dialogDescriptionVariants,
  dialogFooterVariants,
  dialogHeaderVariants,
  dialogOverlayVariants,
  dialogTitleVariants,
} from "../dialog/dialog-variants";

const AlertDialog = AlertDialogPrimitive.Root;
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
const AlertDialogPortal = AlertDialogPrimitive.Portal;
const AlertDialogAction = AlertDialogPrimitive.Action;
const AlertDialogCancel = AlertDialogPrimitive.Cancel;

const AlertDialogOverlay = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    ref={ref}
    className={cn(dialogOverlayVariants(), className)}
    {...props}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

interface AlertDialogContentProps
  extends
    React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>,
    VariantProps<typeof dialogContentVariants> {
  zIndex?: number;
  overlayClassName?: string;
}

const AlertDialogContent = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Content>,
  AlertDialogContentProps
>(
  (
    { className, size, zIndex, overlayClassName, style, children, ...props },
    ref
  ) => (
    <AlertDialogPortal>
      <AlertDialogOverlay className={overlayClassName} style={{ zIndex }} />
      <AlertDialogPrimitive.Content
        ref={ref}
        className={cn(dialogContentVariants({ size }), className)}
        style={{ zIndex, ...style }}
        {...props}
      >
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPortal>
  )
);
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element => (
  <div className={cn(dialogHeaderVariants(), className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogTitle = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn(dialogTitleVariants(), className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ComponentRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn(dialogDescriptionVariants(), className)}
    {...props}
  />
));
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName;

interface AlertDialogBodyProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogBodyVariants> {}

const AlertDialogBody = ({
  className,
  spacing,
  ...props
}: AlertDialogBodyProps): React.JSX.Element => (
  <AlertDialogPrimitive.Description asChild>
    <div
      className={cn(dialogBodyVariants({ spacing }), className)}
      {...props}
    />
  </AlertDialogPrimitive.Description>
);
AlertDialogBody.displayName = "AlertDialogBody";

interface AlertDialogFooterProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dialogFooterVariants> {}

const AlertDialogFooter = ({
  className,
  justify,
  direction,
  ...props
}: AlertDialogFooterProps): React.JSX.Element => (
  <div
    className={cn(dialogFooterVariants({ direction, justify }), className)}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
};
