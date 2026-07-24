"use client";

import { Dialog as SheetPrimitive } from "radix-ui";
import * as React from "react";
import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

import { cn } from "@/components/utils/cn";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "bg-surface-general-modal2 data-[state=open]:animate-in data-[state=open]:fade-in-0 fixed inset-0 z-50",
      "data-[state=open]:[animation-duration:200ms]",
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = tv({
  base: "bg-surface-general-secondary fixed z-50 shadow-lg transition ease-in-out data-[state=open]:duration-300",
  defaultVariants: {
    side: "left",
  },
  variants: {
    side: {
      bottom:
        "data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=open]:[animation-duration:300ms] inset-x-0 bottom-0",
      center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
      left: "data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=open]:[animation-duration:300ms] inset-y-0 left-0 h-full w-3/4 sm:max-w-sm",
      right:
        "data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=open]:[animation-duration:300ms] inset-y-0 right-0 h-full w-3/4 sm:max-w-sm",
      top: "data-[state=open]:animate-in data-[state=open]:slide-in-from-top data-[state=open]:[animation-duration:300ms] inset-x-0 top-0",
    },
  },
});

interface SheetContentProps
  extends
    React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  isShowOverlay?: boolean;
  container?: Element | DocumentFragment | null;
}

const SheetContent = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(
  (
    {
      side = "left",
      className,
      children,
      isShowOverlay = true,
      container,
      ...props
    },
    ref
  ) => (
    <SheetPortal container={container}>
      {isShowOverlay && <SheetOverlay />}
      <SheetPrimitive.Content
        ref={ref}
        className={cn(sheetVariants({ side }), className)}
        {...props}
      >
        {children}
      </SheetPrimitive.Content>
    </SheetPortal>
  )
);
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col text-center sm:text-left", className)}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn(
      "typo-v1-markdown-h1 text-v1-text-hierarchy-primary",
      className
    )}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ComponentRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-v1-text-general-tertiary text-sm", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
