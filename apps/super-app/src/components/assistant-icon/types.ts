import type { TAssistantType } from "@/core/models/assistant";

export interface TAssistantIconProps {
  name: TAssistantType;
  size?: "small" | "medium" | "large";
  iconSize?: number;
  className?: string;
}
