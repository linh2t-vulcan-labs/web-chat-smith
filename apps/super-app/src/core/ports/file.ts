import type { Accept } from "react-dropzone";

import type { TFileIdProps } from "@/components/file-display/types";

import type {
  EConversationMode,
  TFileMessage,
  TSelectedFile,
} from "../models/conversation";
import type { GetFileModel, TUploadFileLinkResponse } from "../models/file";
import type { TResult } from "../models/http";

export interface TFileServiceAPI {
  uploadFile: (file: File) => TResult<TUploadFileLinkResponse>;
  getFileUrl: (fileId: string) => TResult<GetFileModel>;
  createFilesByUrl: (fileUrl: string[]) => TResult<TFileMessage[]>;
}

export interface TFileRepositories {
  addNewFileWithMockId: (
    currentFiles: TSelectedFile[],
    newFile: TSelectedFile
  ) => TSelectedFile[];
  updateFileUrlByMockId: (
    currentFiles: TSelectedFile[],
    fileIds: TFileIdProps,
    fileUrl: string
  ) => TSelectedFile[];
  filterFilesByConversationMode: (
    currentFiles: TSelectedFile[],
    conversationMode: EConversationMode
  ) => TSelectedFile[];
  removeFileByMockId: (
    currentFiles: TSelectedFile[],
    mockId: string
  ) => TSelectedFile[];
  convertFileMessageToSelectedFile: (files: TFileMessage[]) => TSelectedFile[];
  getRecentFiles: () => TFileMessage[];
  removeRecentFile: (fileId: string) => TFileMessage[];
  getFileUploadContent: (options: {
    conversationMode: EConversationMode;
    maxFiles: number;
    maxSizeInMB: number;
    acceptFiles: Accept;
    t: (key: string, values?: Record<string, string | number>) => string;
  }) => string;
}
