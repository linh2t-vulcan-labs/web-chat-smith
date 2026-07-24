import { tv } from "tailwind-variants";

export const featureChipVariants = tv({
  base: "inline-flex items-center justify-center text-xs font-[250] transition duration-300 ease-out cursor-pointer",
  defaultVariants: {
    color: "outline",
    rounded: "pill",
    size: "base",
  },
  variants: {
    color: {
      outline:
        "text-text-inputControl-neutral-default outline-border-general-secondary hover:text-text-inputControl-inverse-default hover:bg-surface-general-bright-overlay outline-solid outline-1 disabled:opacity-30",
      transparent:
        "text-text-inputControl-neutral-default hover:outline-border-general-secondary hover:text-text-inputControl-inverse-default hover:bg-surface-general-soft hover:outline-solid hover:outline-1 focus:outline-hidden disabled:opacity-30",
    },
    disabled: {
      true: "disabled:outline-border-action-tertiary-disabled disabled:pointer-events-none",
    },
    fullWidth: {
      true: "w-full",
    },
    hasEndIcon: {
      true: "pr-small-1",
    },
    isActive: {
      true: "text-text-inputControl-inverse-default bg-surface-general-bright-overlay outline-border-action-primary-hover",
    },
    rounded: {
      pill: "rounded-pill",
    },
    size: {
      base: "px-medium-1.25 py-small-0.75",
      s: "px-medium-2.5 py-small-1",
    },
  },
});
