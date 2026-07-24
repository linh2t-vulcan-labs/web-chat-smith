import type { VariantProps } from "tailwind-variants";

import type { chipVariants } from "./constant";

export type TArrowButtonVariants = VariantProps<typeof chipVariants>;

export type TArrowButtonProps = TArrowButtonVariants & {
  className?: string;
  classIconName?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  icon?: string | React.ReactNode;
};
