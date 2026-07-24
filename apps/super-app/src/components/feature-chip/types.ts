import type { ReactNode } from "react";
import type { VariantProps } from "tailwind-variants";

import type { featureChipVariants } from "./consts";

export type TFeatureChipVariants = VariantProps<typeof featureChipVariants>;

export type TFeatureChipProps = {
  className?: string;
  children?: React.ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
  isActive?: boolean;
  startIconSpacing?: string;
  endIconSpacing?: string;
  // Allow size to be either a simple size value or a responsive object
  size?: TFeatureChipVariants["size"];
  rounded?: TFeatureChipVariants["rounded"];
} & Omit<TFeatureChipVariants, "size" | "rounded"> &
  React.ButtonHTMLAttributes<HTMLButtonElement>;
