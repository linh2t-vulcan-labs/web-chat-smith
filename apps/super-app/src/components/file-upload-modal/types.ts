import type { Accept, FileRejection } from "react-dropzone";

import type { TSelectedFile } from "@/core/models/conversation";

import type { TFileIdProps } from "../file-display/types";

export interface TFileUploadProps {
  isOpen: boolean;
  filePreviews?: TSelectedFile[];
  acceptFiles?: Accept;
  maxFiles: number;
  maxSizeInMB: number;
  fileUploadContent?: string;
  onFiles: (acceptedFiles: File[], fileRejections: FileRejection[]) => void;
  onClick?: (file: TSelectedFile) => void;
  onCancelFiles: (fileIds: TFileIdProps) => void;
  onClose: () => void;
}
