import { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "tailwind-variants";
import { tv } from "tailwind-variants";

import { cn } from "@/features/suite/utils/classnames";

const buttonVariants = tv({
  base: "group/button inline-flex shrink-0 items-center justify-center rounded-lg border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 ",
  defaultVariants: {
    size: "default",
    variant: "default",
  },
  variants: {
    size: {
      default:
        "h-8 gap-1.5 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2",
      icon: "size-8",
      "icon-lg": "size-9",
      "icon-sm":
        "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
      "icon-xs":
        "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
      lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2",
      sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3.5",
      xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3",
    },
    variant: {
      default: "bg-primary text-primary-foreground [a]:hover:bg-primary/80",
      destructive:
        "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
      ghost: "aria-expanded:bg-muted aria-expanded:text-foreground ",
      link: "text-primary underline-offset-4 hover:underline",
      outline:
        " bg-background aria-expanded:bg-muted aria-expanded:text-foreground ",
      secondary:
        "bg-secondary text-secondary-foreground aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
    },
  },
});

// tailwind-variants' generated prop types omit `null`, but its runtime treats `null` the same as
// cva did: skip the variant's default entirely (verified: `buttonVariants({ size: null })` yields
// only `base`, vs. `undefined`/omitted applying `defaultVariants`). Callers rely on that opt-out
// (e.g. upload-dialog.tsx passes `size={null}`), so the prop type is widened to match.
type ButtonVariants = VariantProps<typeof buttonVariants>;
type NullableButtonVariants = {
  [K in keyof ButtonVariants]: ButtonVariants[K] | null;
};

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & NullableButtonVariants) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({ className, size, variant } as ButtonVariants)
      )}
      {...props}
    />
  );
}

export { Button };
