import type { FileError, FileRejection } from "react-dropzone";
import { ErrorCode } from "react-dropzone";
import { toast } from "sonner";

import { ACCEPT_FILES_COMMON } from "@/components/file-upload-area/consts";

import { mbToBytes } from "./helpers";

interface TFileOptions {
  maxSize?: number;
  accept?: string[];
}

export interface TErrorCommon {
  code: string;
  message: string;
  source: string;
}

export interface TFetchErrorDetail {
  code?: number | string;
  contentType?: string;
  details?: { error?: string }[];
  message?: string;
  reason?: string;
  status?: number;
}

export interface TFetchError {
  status: number;
  message: string;
  error?: TFetchErrorDetail;
}

export class THttpError extends Error {
  declare status: number;
  declare message: string;
  declare error?: TFetchErrorDetail;

  constructor({ status, message, error }: TFetchError) {
    super(message);
    this.name = "THttpError";
    this.status = status;
    this.error = error;
  }
}

type TErrorCodeUploadFile = ErrorCode | "default";

const ERROR_PRIORITY: TErrorCodeUploadFile[] = [
  ErrorCode.TooManyFiles,
  ErrorCode.FileTooLarge,
  ErrorCode.FileTooSmall,
  ErrorCode.FileInvalidType,
  "default",
];

const ERROR_MESSAGES: Record<
  TErrorCodeUploadFile,
  (maxAllowFiles?: number) => string
> = {
  [ErrorCode.TooManyFiles]: (max) =>
    `You can only upload ${max} files at a time.`,
  [ErrorCode.FileTooLarge]: () =>
    "File size exceeds the 20MB limit. Please upload a smaller file.",
  [ErrorCode.FileTooSmall]: () =>
    "File size is too small. Please upload a larger file.",
  [ErrorCode.FileInvalidType]: () =>
    "File is corrupted or cannot be processed. Please check the file and try again.",
  default: () =>
    "File is corrupted or cannot be processed. Please check the file and try again.",
};

export const handleUploadErrors = (
  fileRejection: FileRejection,
  maxAllowFiles?: number
) => {
  const seenErrors = new Set<TErrorCodeUploadFile>();
  for (const error of fileRejection.errors) {
    const code = (error.code || "default") as ErrorCode;

    if (!seenErrors.has(code)) {
      seenErrors.add(code);
    }
  }

  // Prioritize and show only the most important error
  for (const code of ERROR_PRIORITY) {
    if (seenErrors.has(code)) {
      const message = ERROR_MESSAGES[code](maxAllowFiles);
      toast.error(undefined, { description: message });
      break;
    }
  }
};

export const fileValidator = (
  file: File,
  options?: TFileOptions
): FileError | null => {
  const { maxSize = mbToBytes(20), accept = Object.keys(ACCEPT_FILES_COMMON) } =
    options || {};

  if (file.size > maxSize) {
    return {
      code: "file-too-large",
      message: `File is larger than ${maxSize / 1024 / 1024} MB`,
    };
  }

  if (!accept.includes(file.type)) {
    return {
      code: "file-invalid-type",
      message: "Only JPEG/PNG/GIF images are allowed",
    };
  }

  return null;
};
