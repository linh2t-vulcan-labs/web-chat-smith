import type { VariantProps } from "tailwind-variants";

import type { badgeVariant, dotBadgeVariant } from "./consts";

export type TBadgeVariant = VariantProps<typeof badgeVariant>;
export type TDotBadgeVariant = VariantProps<typeof dotBadgeVariant>;

export type TDotBadgeProps = TDotBadgeVariant & {
  type: "dot";
  size?: "small" | "medium";
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
};

export type TDefaultBadgeProps = TBadgeVariant & {
  type: "default";
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
  onClick?: () => void;
};
export type TBadgeProps = TDotBadgeProps | TDefaultBadgeProps;
