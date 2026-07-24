import type { ReactNode } from "react";
import type { VariantProps } from "tailwind-variants";

import type { textButtonVariants } from "./consts";

export type TTextButtonVariants = VariantProps<typeof textButtonVariants>;

export type TTextButtonProps = {
  className?: string;
  children?: React.ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
} & TTextButtonVariants &
  React.ButtonHTMLAttributes<HTMLButtonElement>;
