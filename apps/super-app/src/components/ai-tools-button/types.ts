import type { TBadgeVariant } from "@/components/badge/types";

export interface TAIToolsButtonProps {
  features: TChatFeature[];
  onRenderBadgeNew?: (
    id: string,
    badge: { text: string; color: TBadgeVariant["color"] }
  ) => React.ReactNode;
}

export interface TChatFeature {
  id: string;
  label: string;
  icon: string;
  badge?: {
    color: TBadgeVariant["color"];
    text: string;
  };
  tooltip?: string;
  isEnabled: boolean;
  isActive: boolean;
  isDisabled: boolean;
  onClick: () => void;
}
