import type { TMessageTemp } from "@/core/models/conversation";

export interface TMessageDeepResearchProps {
  message: TMessageTemp;
  isShowRegenerateButton: boolean;
  isGenerating: boolean;
  onRegenerateMessage: () => void;
  onCopyMessage: () => void;
}

export interface TDeepResearchThinkingItemProps {
  title: React.ReactNode;
  content: string;
  className: string;
  onClickBadgeReference: (index: number) => void;
}
export interface TDeepResearchSourcesButtonProps {
  onClick?: () => void;
}

export interface TDeepResearchThinkingHeaderProps {
  timing?: number;
  amountOfSource?: number;
}

export interface TDeepResearchReachedLimitMessageProps {
  content: string;
}
