import type { CSSProperties, FormEvent, ReactNode } from "react";

import type {
  PromptInputMessage,
  PromptInputProps,
} from "@/features/suite/components/ui/ai-elements/prompt-input";

import type { PromptInputUploadDialogProps } from "../upload-dialog/index";

export interface PromptingInputLogoHeaderProps {
  brandName: string;
  onBrandNameChange: (value: string) => void;
  industry: string;
  onIndustryChange: (value: string) => void;
  style: string;
  onStyleChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
}

export interface UsecaseChipData {
  icon: ReactNode;
  label: string;
  iconColorClass?: string;
  iconStyle?: CSSProperties;
  onDismiss?: () => void;
}

export type SuitePromptInputProps = Omit<
  PromptInputProps,
  "onSubmit" | "className"
> & {
  onSubmitAction: (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>
  ) => void | Promise<void>;
  placeholder?: string | string[];
  textAreaClassName?: string;
  textInputMinHeight?: string;
  textInputMaxHeight?: string;
  showTypingPlaceholder?: boolean;
  className?: string;
  page?: "home" | "detail";
  usecaseChip?: UsecaseChipData;
  uploadDialogProps?: PromptInputUploadDialogProps;
  isStreaming?: boolean;
  onStop?: () => void;
  onUploadClick?: () => void;
  // When true (e.g. image quota reached), disables submit and blocks the submit call. Defaults to off.
  isSubmitDisabled?: boolean;
};
