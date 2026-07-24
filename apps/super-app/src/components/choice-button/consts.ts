import { tv } from "tailwind-variants";

export const choiceButtonVariants = tv({
  base: "inline-flex items-center justify-center font-medium transition duration-300 ease-out cursor-pointer",
  defaultVariants: {
    color: "primary",
    rounded: "default",
    size: "base",
  },
  variants: {
    color: {
      primary:
        "text-text-inputControl-neutral-default outline-border-general-secondary hover:outline-border-general-primary hover:bg-surface-general-bright-overlay outline-solid outline-1 disabled:brightness-50",
    },
    disabled: {
      true: "disabled:pointer-events-none",
    },
    rounded: {
      default: "rounded-full",
    },
    size: {
      base: "px-small-1 py-small-0.25 text-[10px]",
      medium: "px-medium-1.25 py-small-0.75 text-xs",
    },
  },
});
