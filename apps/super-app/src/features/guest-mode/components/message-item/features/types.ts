import type { TMessageTemp } from "@/core/models/conversation";

export interface TMessageNormalProps {
  message: TMessageTemp;
  isShowRegenerateButton: boolean;
  isGenerating: boolean;
  isNewMessage?: boolean;
}

export interface TMessageDeepResearchProps {
  message: TMessageTemp;
  isShowRegenerateButton: boolean;
  isGenerating: boolean;
  onRegenerateMessage: () => void;
  onCopyMessage: () => void;
}
