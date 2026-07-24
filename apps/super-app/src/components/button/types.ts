import type { ReactNode } from "react";
import type { VariantProps } from "tailwind-variants";

import type { buttonVariants } from "./consts";

export type TButtonVariants = VariantProps<typeof buttonVariants>;

export type TButtonProps = {
  className?: string;
  children?: React.ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  // Allow size to be either a simple size value or a responsive object
  size?: TButtonVariants["size"];
  rounded?: TButtonVariants["rounded"];
} & Omit<TButtonVariants, "size" | "rounded"> &
  React.ButtonHTMLAttributes<HTMLButtonElement>;
