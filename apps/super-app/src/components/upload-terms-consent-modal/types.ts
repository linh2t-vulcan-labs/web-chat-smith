import type { EConversationMode } from "@/core/models/conversation";

export interface UploadTermsConsentModalProps {
  open: boolean;
  conversationMode: EConversationMode;
  onSuccess?: () => void;
  onClose: () => void;
}
