import { tv } from "tailwind-variants";

export const buttonV3Variants = tv({
  base: [
    "relative",
    "px-8 py-4",
    "text-base text-white",
    "backdrop-blur-[2px]",
    "rounded-full",
    "before:absolute before:inset-0 before:-z-10 before:content-['']",
    "before:rounded-full before:p-px",
    "before:bg-[linear-gradient(to_bottom_right,#093E3F_25%,#093E3F_20%,#84ffe1_50%,#093E3F_70%)]",
    "before-mask-composite-exclude",
  ],
  defaultVariants: {
    color: "cyan",
    size: "base",
  },
  variants: {
    color: {
      cyan: "bg-[rgba(0,44,45,0.35)]",
      teal: "bg-[rgba(10,188,191,0.30)]",
    },
    size: {
      base: "px-medium-2.5 py-small-1",
      icon: "p-small-1",
      large: "gap-small-1 px-medium-3 py-medium-2",
      small: "px-medium-2 py-small-0.75",
      xxs: "px-medium-1.5 py-small-0.75",
    },
  },
});
