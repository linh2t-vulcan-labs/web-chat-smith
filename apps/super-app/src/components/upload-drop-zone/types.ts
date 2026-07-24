import React from "react";
import type { Accept, FileRejection } from "react-dropzone";

export interface TUploadDropzoneProps {
  className?: string;
  children: React.ReactNode;
  acceptFiles?: Accept;
  maxFiles: number;
  maxSizeInMB: number;
  multiple?: boolean;
  isDisabled?: boolean;
  fileUploadContent?: string;
  onFilesSelected: (
    acceptedFiles: File[],
    fileRejections: FileRejection[]
  ) => void;
}
