import type { FileRejection } from "react-dropzone";

export type TConversationInputProps = Readonly<{
  userInput: string;
  className?: string;
  isPending: boolean;
  enableEnterPress?: boolean;
  isLoading?: boolean;
  isGenerating?: boolean;
  onSubmit?: () => Promise<void>;
  onStopGenerating?: () => void;
  onChangeInput?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPaste: (acceptedFiles: File[], fileRejections: FileRejection[]) => void;
  onOpenImageUploadNotSupportedModel?: () => void;
}>;

export type TSubmitButtonStatus = "active" | "inactive";
export type TSubmitButton = Readonly<{
  disabled?: boolean;
  onClick?: () => void;
}>;

export type TButtonGenerateProps = Readonly<{
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}>;

export type TCharacterCountStatus = "success" | "error";
export type TCharacterCountProps = Readonly<{
  total: number;
  current: number;
  onStatus?: (status: TCharacterCountStatus) => void;
}>;
