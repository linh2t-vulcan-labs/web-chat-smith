import React from "react";
import type { VariantProps } from "tailwind-variants";

import type { statusBadge, statusDot } from "./consts";

export type TStatusBadgeVariants = VariantProps<typeof statusBadge>;
export type TStatusDotVariants = VariantProps<typeof statusDot>;

export type TStatusBadgeProps = {
  className?: string;
  children: React.ReactNode;
} & TStatusBadgeVariants &
  TStatusDotVariants;
