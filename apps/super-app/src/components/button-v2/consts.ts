import { tv } from "tailwind-variants";

export const buttonV2Variants = tv({
  base: "inline-flex items-center justify-center text-sm font-medium transition duration-300 ease-out cursor-pointer",
  defaultVariants: {
    color: "primary",
    rounded: "rounded",
    size: "base",
  },
  variants: {
    color: {
      danger:
        "text-text-action-secondary-default hover:bg-surface-action-negative-hover bg-[#FF5C5C] disabled:bg-[#b54a49]",
      dangerV2:
        "text-text-general-primary bg-text-system-natural-red hover:brightness-75 focus:outline-hidden disabled:brightness-50",
      outline:
        "text-text-general-primary outline-border-general-secondary hover:bg-surface-general-soft hover:text-text-general-primary hover:outline-border-inputControls-neutral-hover outline-solid outline-1 disabled:opacity-30",
      primary:
        "text-text-general-primary bg-surface-action-primary-default hover:bg-surface-action-primary-hover focus:outline-hidden disabled:brightness-50",
      secondary:
        "text-text-general-inverse bg-surface-action-inverse-default hover:bg-surface-action-inverse-hover active:bg-surface-action-inverse-hover disabled:bg-surface-action-inverse-disabled",
      tertiary: "text-text-general-secondary bg-surface-general-tertiary",
      text: "text-text-general-quaternary hover:opacity-80 disabled:opacity-80",
    },
    disabled: {
      true: "disabled:pointer-events-none disabled:cursor-not-allowed",
    },
    fullWidth: {
      true: "w-full",
    },
    rounded: {
      circle: "rounded-[50%]",
      rounded: "rounded-rounded",
    },
    size: {
      base: "px-medium-2.5 py-small-1",
      icon: "p-small-1",
      large: "px-medium-3 py-medium-2 gap-small-1",
      small: "px-medium-2 py-small-0.5",
      xxs: "px-medium-1.5 py-small-0.75",
    },
  },
});
