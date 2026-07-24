import type { TMessageTemp } from "@/core/models/conversation";

export interface TAIArtMessageProps {
  message: TMessageTemp;
  isShowRegenerateButton: boolean;
  isGenerating: boolean;
  isNewMessage?: boolean;
  onRegenerateMessage: () => void;
  onCopyMessage: () => void;
}

export interface TAIArtReachedLimitMessageProps {
  content: string;
}

export interface TAIArtComingSoonMessageProps {
  message: TMessageTemp;
}
