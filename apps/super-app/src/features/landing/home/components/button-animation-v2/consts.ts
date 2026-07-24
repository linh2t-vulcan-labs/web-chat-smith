import { tv } from "tailwind-variants";

export const buttonAnimVariants = tv({
  base: ["relative", "text-base", "rounded-full"],
  defaultVariants: {
    size: "base",
  },
  variants: {
    size: {
      base: "px-medium-2.5 py-small-1",
      icon: "p-small-1",
      large: "gap-small-1 px-medium-2.5 py-medium-2",
      small: "px-medium-2 py-small-0.75",
      xxs: "px-medium-1.5 py-small-0.5",
    },
    variant: {
      teal: "",
      turquoise: "",
    },
  },
});
