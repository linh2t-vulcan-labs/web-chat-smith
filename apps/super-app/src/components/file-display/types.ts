import type { TSelectedFile } from "@/core/models/conversation";

export interface TFileIdProps {
  mockId: string;
  fileId?: string;
}

export interface TFileDisplayProps {
  displayFile: TSelectedFile;
  allowFetching: boolean;
  allowPreview?: boolean;
  size?: "medium" | "large";
  imageDisplayMode?: "card" | "inline";
  className?: string;
  isShowCloseIcon?: boolean;
  getDownloadUrl?: (fileIds: TFileIdProps, fileUrl: string) => void;
  onClickFile?: (file: TSelectedFile) => void;
  onClickCancel?: (fileIds: TFileIdProps) => void;
  onRemoveFileUpload?: (fileIds: TFileIdProps) => void;
  getLoadingState?: (fileIds: TFileIdProps, isLoading: boolean) => void;
  getErrorState?: (fileIds: TFileIdProps, isError: boolean) => void;
}
