import { tv } from "tailwind-variants";

export const chipVariants = tv({
  base: "rounded-circle gap-small-0.75 inline-flex items-center justify-center text-base font-bold transition duration-300 ease-out cursor-pointer",
  defaultVariants: {
    color: "tertiary",
    size: "medium",
  },
  variants: {
    color: {
      default:
        "text-text-action-inverse-default bg-surface-action-default-default hover:bg-surface-action-default-hover hover:text-text-action-secondary-default disabled:text-text-action-secondary-default disabled:bg-surface-action-default-hover disabled:opacity-50",
      line: "text-text-action-tertiary-default border-border-action-tertiary-default hover:border-border-action-tertiary-hover border-2 disabled:opacity-20",
      negative:
        "text-text-action-secondary-default bg-surface-action-negative-default hover:bg-surface-action-negative-hover disabled:opacity-20",
      neutral:
        "text-text-action-tertiary-default bg-surface-action-neutral-default hover:bg-surface-action-neutral-hover disabled:bg-surface-action-neutral-disabled",
      primary:
        "text-text-action-secondary-default bg-surface-action-primary-default hover:bg-surface-action-primary-default/60 disabled:opacity-20",
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
    size: {
      medium: "size-10",
    },
  },
});
