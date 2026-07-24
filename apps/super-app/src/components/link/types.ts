import type { ReactNode } from "react";
import type { VariantProps } from "tailwind-variants";

import type { linkVariants } from "./consts";

export type TLinkVariants = VariantProps<typeof linkVariants>;

export type TLinkProps = {
  className?: string;
  children?: React.ReactNode;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  fullWidth?: boolean;
} & TLinkVariants &
  React.AnchorHTMLAttributes<HTMLAnchorElement>;
