import type { ReactNode } from "react";

type BadgeSize = "small" | "medium" | "large";
type BadgeAs = "button" | "tag";
type BadgeType = "new" | "premium" | "expired" | "free";

export interface GradientBadgeProps {
  containerClassName?: string;
  text: string | ReactNode;
  as?: BadgeAs;
  size?: BadgeSize;
  type?: BadgeType;
  onBadgeClick?: () => void;
}
