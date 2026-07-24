import type { AIModelItem } from "@/core/models/model";

export interface TSelectionModelProps {
  models: AIModelItem[];
  seenModels: AIModelItem[];
  selectedModel: AIModelItem;
  isPremiumUser?: boolean;
  disabled?: boolean;
  onModelSelect: (model: AIModelItem) => void;
}

export interface TSelectionListProps {
  models: AIModelItem[];
  seenModels: AIModelItem[];
  selectedModel: AIModelItem;
  isPremiumUser?: boolean;
  onModelSelect: (model: AIModelItem) => void;
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
  models: AIModelItem[];
  onChange: (provider: string) => void;
}
