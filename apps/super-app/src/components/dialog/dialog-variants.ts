import { tv } from "tailwind-variants";

export const dialogOverlayVariants = tv({
  base: [
    "bg-v1-surface-overlay-scrim-light dark:bg-v1-surface-overlay-scrim-blocking fixed inset-0 z-50",
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-200",
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:duration-150",
  ].join(" "),
});

export const dialogContentVariants = tv({
  base: [
    "fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
    "max-h-[calc(100dvh-80px)] max-w-[calc(100vw-32px)] w-full",
    "bg-v1-surface-hierarchy-raised rounded-v1-2xl",
    "thickness-v1-heavy border-v1-border-structural-subtle",
    "focus:outline-hidden",
    // Enter: fade + zoom from 75% scale, starting at exact center position
    "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-75",
    "data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
    "data-[state=open]:duration-300 data-[state=open]:ease-out",
    // Exit: reverse — faster for snappy feel
    "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-75",
    "data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]",
    "data-[state=closed]:duration-200 data-[state=closed]:ease-in",
  ].join(" "),
  defaultVariants: {
    size: "md",
  },
  variants: {
    size: {
      "2xl": "sm:max-w-2xl",
      lg: "sm:max-w-lg",
      md: "sm:max-w-md",
      sm: "sm:max-w-sm",
      xl: "sm:max-w-xl",
    },
  },
});

export const dialogHeaderVariants = tv({
  base: "flex items-center justify-between py-v1-structural-component-large",
});

export const dialogTitleVariants = tv({
  base: "typo-v1-heading-h3 text-v1-text-hierarchy-primary flex-1",
});

export const dialogDescriptionVariants = tv({
  base: "text-v1-text-hierarchy-secondary text-sm",
});

export const dialogBodyVariants = tv({
  base: "text-v1-text-hierarchy-primary px-v1-structural-component-medium",
  variants: {
    spacing: {
      lg: "py-medium-4",
      md: "py-medium-3",
      none: "py-0",
      sm: "py-medium-2",
    },
  },
});

export const dialogFooterVariants = tv({
  base: "flex items-center px-v1-structural-component-medium gap-v1-structural-content-micro ",
  defaultVariants: {
    direction: "row",
    justify: "end",
  },
  variants: {
    direction: {
      column: "flex-col",
      "column-reverse": "flex-col-reverse",
      row: "flex-row",
      "row-reverse": "flex-row-reverse",
    },
    justify: {
      between: "justify-between",
      center: "justify-center",
      end: "justify-end",
      start: "justify-start",
    },
  },
});
