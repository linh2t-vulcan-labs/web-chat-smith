import type { TMessageType } from "@/core/models/conversation";

export interface TMessageFeedbackModalProps {
  open: boolean;
  onClose: () => void;
  messageType: TMessageType;

  onSubmit?: (detail: { reason: string[]; reasonDetail: string }) => void;
}

export interface TMessageFeedbackChipOption {
  id: string;
  content: string;
}

export interface TFeedbackChipListProps {
  options: TMessageFeedbackChipOption[];
  activeOptions: TMessageFeedbackChipOption[];
  onClick: (option: TMessageFeedbackChipOption) => void;
}

export interface TFeedbackInputProps {
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}
