import type { EConversationMode } from "@/core/models/conversation";

export interface TDeepResearchProps {
  onClick?: () => void;
  disabled?: boolean;
  isActive: boolean;
}

export interface TFileUploadProps {
  disabled?: boolean;
  onOpenConfirmModel?: () => void;
}

export interface TSelectionModelAIChipProps {
  disabled?: boolean;
}

export interface TAITools {
  mode: EConversationMode;
  isDisabledFileUpload?: boolean;
  isDisabledAIArt?: boolean;
  isDisabledDeepSearch?: boolean;
  isDisabledWebSearch?: boolean;
  onSelectFeature: (mode: EConversationMode) => void;
  onOpenConfirmModel?: () => void;
}

export interface TModeHighlightTextProps {
  mode: EConversationMode;
}
