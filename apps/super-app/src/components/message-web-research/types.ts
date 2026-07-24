import type { TMessageTemp } from "@/core/models/conversation";

export interface TWebResearchProps {
  message: TMessageTemp;
  isShowRegenerateButton: boolean;
  isGenerating: boolean;
  isNewMessage?: boolean;
  onRegenerateMessage: () => void;
  onCopyMessage: () => void;
}
