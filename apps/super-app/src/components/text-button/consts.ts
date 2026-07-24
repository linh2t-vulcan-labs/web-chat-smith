import { tv } from "tailwind-variants";

export const textButtonVariants = tv({
  base: "gap-small-0.75 px-medium-1.5 rounded-soft py-small-1 inline-flex items-center justify-center text-left text-sm font-normal transition-all duration-300 ease-out cursor-pointer",
  defaultVariants: {
    color: "primary",
  },
  variants: {
    color: {
      neutralHighlight:
        "text-text-inputControl-inverse-default outline-border-inputControls-neutral-default bg-surface-inputControl-neutral-default-disabled hover:bg-surface-inputControl-neutral-hover outline-solid outline-1 disabled:opacity-20",
      neutralOutline:
        "text-text-inputControl-neutral-default outline-border-inputControls-neutral-default hover:outline-border-inputControls-neutral-hover outline-solid outline-1 disabled:opacity-30",
      neutralOutlineBright:
        "text-text-inputControl-neutral-default outline-border-inputControls-neutral-default hover:text-text-inputControl-inverse-default hover:outline-border-action-tertiary-hover outline-solid outline-1 disabled:opacity-30",
      primary:
        "text-text-action-secondary-default bg-surface-action-primary-default hover:bg-surface-action-primary-default/60 disabled:opacity-20",
      primaryHighlight:
        "text-text-inputControl-inverse-default outline-border-inputControls-highlight-default bg-surface-inputControl-highlight-disabled  hover:bg-surface-inputControl-highlight-hover outline-solid outline-1 disabled:opacity-20",
      primaryOutline:
        "text-text-inputControl-highlight-default hover:outline-border-inputControls-highlight-hover outline-border-inputControls-highlight-default outline-solid outline-1 disabled:opacity-50",
      transparent:
        "text-text-inputControl-neutral-default hover:bg-surface-inputControl-neutral-disabled bg-transparent disabled:opacity-30",
    },
    disabled: {
      true: "disabled:pointer-events-none",
    },
    fullWidth: {
      true: "w-full",
    },
  },
});
