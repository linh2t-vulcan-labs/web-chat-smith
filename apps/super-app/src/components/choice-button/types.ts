import type { VariantProps } from "tailwind-variants";

import type { choiceButtonVariants } from "./consts";

export type TChoiceButtonVariants = VariantProps<typeof choiceButtonVariants>;

export type TChoiceButtonProps = {
  className?: string;
  children?: React.ReactNode;
} & TChoiceButtonVariants &
  React.ButtonHTMLAttributes<HTMLButtonElement>;
