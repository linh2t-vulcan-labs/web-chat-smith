import type { ReactNode } from "react";

export interface TTooltipProps {
  classNames?: string;
  children: ReactNode;
  content: ReactNode;
  color?: "dark" | "light";
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  delayDuration?: number;
  isEnabled?: boolean;
  triggerMode?: "hover" | "click" | "auto";
}
