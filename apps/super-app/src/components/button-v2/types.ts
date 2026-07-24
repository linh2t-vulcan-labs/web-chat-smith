import type { ReactNode } from "react";
import type { VariantProps } from "tailwind-variants";

import type { buttonV2Variants } from "./consts";

export type TButtonV2Variants = VariantProps<typeof buttonV2Variants>;

export type TButtonV2Props = {
  className?: string;
  children?: React.ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  // Allow size to be either a simple size value or a responsive object
  size?: TButtonV2Variants["size"];
  rounded?: TButtonV2Variants["rounded"];
} & Omit<TButtonV2Variants, "size" | "rounded"> &
  React.ButtonHTMLAttributes<HTMLButtonElement>;
