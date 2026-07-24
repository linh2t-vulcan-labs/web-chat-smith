import { tv } from "tailwind-variants";

export const buttonVariants = tv({
  base: "gap-small-0.75 inline-flex items-center justify-center text-base font-bold transition duration-300 ease-out cursor-pointer",
  compoundVariants: [
    {
      class: "max-h-[40px]",
      color: "line",
      size: "base",
    },
    {
      class: "max-h-[56px]",
      color: "line",
      size: "large",
    },
    {
      class: "hover:bg-surface-action-neutral-hover bg-transparent",
      color: "negative",
      size: "smallIcon",
    },
    {
      class: "rounded-none transition-none",
      size: "none",
    },
    {
      class: "text-sm",
      size: "small",
    },
  ],
  defaultVariants: {
    color: "primary",
    rounded: "default",
    size: "base",
  },
  variants: {
    color: {
      default:
        "text-text-action-inverse-default bg-surface-action-default-default hover:bg-surface-action-default-hover hover:text-text-action-secondary-default disabled:text-text-action-secondary-default disabled:bg-surface-action-default-hover disabled:opacity-50",
      line: "text-text-action-tertiary-default border-border-action-tertiary-default hover:border-border-action-tertiary-hover border-2 disabled:opacity-20",
      negative:
        "text-text-action-secondary-default bg-surface-action-negative-default hover:bg-surface-action-negative-hover disabled:opacity-20",
      neutral:
        "text-text-action-tertiary-default bg-surface-action-neutral-default hover:bg-surface-action-neutral-hover disabled:bg-surface-action-inverse-disabled dark:disabled:bg-surface-action-neutral-disabled",
      neutralOutline:
        "text-text-general-primary outline-border-general-secondary hover:outline-border-inputControls-neutral-hover outline-solid outline-1 disabled:opacity-30",
      none: "",
      primary:
        "text-text-action-secondary-default bg-surface-action-primary-default hover:bg-surface-action-primary-default/60 disabled:brightness-50",
      secondary:
        "text-text-action-inverse-default bg-surface-action-secondary-default hover:bg-surface-action-secondary-default/60 disabled:bg-surface-action-secondary-disabled disabled:opacity-20",
      tertiary:
        "text-text-action-primary-default bg-surface-action-neutral-default hover:bg-surface-action-neutral-hover disabled:opacity-30",
      text: "hover:opacity-80 disabled:opacity-80",
    },
    disabled: {
      true: "disabled:pointer-events-none",
    },
    fullWidth: {
      true: "w-full",
    },
    rounded: {
      default: "rounded-default",
      pillSoft: "rounded-pill-soft",
      rounded: "rounded-rounded",
      soft: "rounded-soft",
    },
    size: {
      base: "px-medium-3 py-small-1",
      baseIcon: "p-small-1",
      large: "px-medium-3 py-medium-2 gap-small-1",
      largeIcon: "p-medium-2",
      medium: "px-medium-3 py-small-1 min-w-[134px]",
      none: "p-0",
      small: "px-medium-2 py-small-0.5",
      smallIcon: "p-small-0.5",
    },
  },
});
