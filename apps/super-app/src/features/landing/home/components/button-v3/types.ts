import type { VariantProps } from "tailwind-variants";

import type { buttonV3Variants } from "./consts";

export type TButtonV2Variants = VariantProps<typeof buttonV3Variants>;

export type TButtonV3Props = {
  className?: string;
  children?: React.ReactNode;
  // Allow size to be either a simple size value or a responsive object
  size?: TButtonV2Variants["size"];
  color?: TButtonV2Variants["color"];
} & Omit<TButtonV2Variants, "size" | "color"> &
  React.ButtonHTMLAttributes<HTMLButtonElement>;
