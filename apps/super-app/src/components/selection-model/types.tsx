import type { AIModel, AIModelItem } from "@/core/models/model";

export interface TSelectionModelProps {
  models: AIModel[];
  seenModels?: AIModelItem[];
  selectedModel: AIModelItem;
  isPremiumUser?: boolean;
  isGuestUser?: boolean;
  disabled?: boolean;
  onModelSelect: (model: AIModelItem) => void;
  onSignIn?: () => void;
}

export interface TSelectionListProps {
  models: AIModel[];
  seenModels?: AIModelItem[];
  selectedModel: AIModelItem;
  isPremiumUser?: boolean;
  isGuestUser?: boolean;
  onModelSelect: (model: AIModelItem) => void;
  onSignIn?: () => void;
}

export interface TModelTabProps {
  className?: string;
  image: React.ReactNode;
  name: string;
  isActive?: boolean;
  onClick?: () => void;
  hasNewModel?: boolean;
}

export interface TTabs {
  activeIndex: number;
  models: AIModel[];
  seenModels?: AIModelItem[];
  onChange: (provider: string) => void;
}
