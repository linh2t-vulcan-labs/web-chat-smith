import type { TBadgeVariant } from "@/components/badge/types";

export interface TAIToolsGuestButtonProps {
  features: TChatGuestFeature[];
  onSignIn?: (conversationMode: string) => void;
}

export interface TChatGuestFeature {
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
