import type { CustomResponseItem } from "@/core/models/model";

export interface TSelectionModelProps {
  models: CustomResponseItem[];
  seenModels: boolean;
  selectedModel: string | null;
  isPremiumUser?: boolean;
  disabled?: boolean;
  onModelSelect: (tone: string) => void;
  onSetSeenCustomResponse?: () => void;
}

export interface TSelectionListProps {
  models: CustomResponseItem[];
  seenModels: boolean;
  selectedModel: string | null;
  isPremiumUser?: boolean;
  onModelSelect: (tone: string) => void;
}

export interface TModelTabProps {
  className?: string;
  image: React.ReactNode;
  name: string;
  isActive?: boolean;
  onClick?: () => void;
}

export interface TTabs {
  activeIndex: number;
  models: CustomResponseItem[];
  onChange: (provider: string) => void;
}
