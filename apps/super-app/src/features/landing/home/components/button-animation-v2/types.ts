import type { VariantProps } from "tailwind-variants";

import type { buttonAnimVariants } from "./consts";

export type TButtonAnimVariants = VariantProps<typeof buttonAnimVariants>;

export type TButtonAnimProps = {
  className?: string;
  children?: React.ReactNode;
  size?: TButtonAnimVariants["size"];
  variant?: "teal" | "turquoise";
} & Omit<TButtonAnimVariants, "size"> &
  React.ButtonHTMLAttributes<HTMLButtonElement>;
