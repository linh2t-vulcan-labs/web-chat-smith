import type { Accept, DropEvent, FileRejection } from "react-dropzone";

export interface TFileUploadAreaProps {
  acceptFiles?: Accept;
  maxFiles: number;
  maxSizeInMB: number;
  multiple?: boolean;
  fileUploadContent?: string;
  onFilesSelected: (
    acceptedFiles: File[],
    fileRejections: FileRejection[],
    event?: DropEvent
  ) => void;
}
