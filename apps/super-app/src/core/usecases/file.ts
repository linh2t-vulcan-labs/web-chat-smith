import { toast } from "sonner";

import {
  getRecentFilesFromLocalStorage,
  removeRecentFilesFromLocalStorage,
} from "@/core/instances/file-storage";
import type { TSelectedFile } from "@/core/models/conversation";
import { EConversationMode } from "@/core/models/conversation";
import { generateRandomUUIDV4 } from "@/utils/commons/helpers";
import { extensionToMimeTypeMap } from "@/utils/constants/file";

import type { TFileRepositories } from "../ports/file";

const addNewFileWithMockId: TFileRepositories["addNewFileWithMockId"] = (
  currentFiles,
  newFile
) => {
  const updateSelectedFile = [
    ...currentFiles,
    {
      ...newFile,
      mockId: generateRandomUUIDV4(),
    },
  ];

  return updateSelectedFile;
};

const updateFileUrlByMockId: TFileRepositories["updateFileUrlByMockId"] = (
  currentFiles,
  fileIds,
  fileUrl
) =>
  currentFiles.map((selectedFile) => {
    if (selectedFile.mockId === fileIds.mockId) {
      return {
        ...selectedFile,
        fileId: fileIds.fileId,
        fileUrl,
      };
    }

    return selectedFile;
  });

const removeFileByMockId: TFileRepositories["removeFileByMockId"] = (
  currentFiles,
  mockId
) => currentFiles.filter((selectedFile) => mockId !== selectedFile.mockId);

const convertFileMessageToSelectedFile: TFileRepositories["convertFileMessageToSelectedFile"] =
  (files) =>
    files.map((file) => ({
      fileId: file.fileId,
      fileName: file.fileName,
      fileSize: file.fileSize,
      fileUrl: file.downloadUrl,
      mimeType: file.fileMimeType,
      mockId: generateRandomUUIDV4(),
    }));

interface FileFilterHandler {
  filterCondition: (file: TSelectedFile) => boolean;
  onFiltered?: (file: TSelectedFile) => void;
}

const filterFilesByConversationMode: TFileRepositories["filterFilesByConversationMode"] =
  (files, conversationMode) => {
    const fileFilterStrategies: Record<EConversationMode, FileFilterHandler> = {
      [EConversationMode.AI_ART]: {
        filterCondition: (file) => file.mimeType !== extensionToMimeTypeMap.pdf,
        onFiltered: (_file) => {
          toast.error(null, {
            description: "This feature doesn't support file PDF",
          });
        },
      },
      [EConversationMode.CHAT]: {
        filterCondition: () => true, // allow all
      },
      [EConversationMode.DEEP_RESEARCH]: {
        filterCondition: () => true, // allow all
      },
      [EConversationMode.WEB_SEARCH]: {
        filterCondition: () => true, // allow all
      },
    };

    const { filterCondition, onFiltered } =
      fileFilterStrategies[conversationMode];

    return files.filter((file) => {
      const isValid = filterCondition(file);

      if (!isValid && onFiltered) {
        onFiltered(file);
      }
      return isValid;
    });
  };
const removeRecentFile: TFileRepositories["removeRecentFile"] = (fileId) =>
  removeRecentFilesFromLocalStorage(fileId);

const getRecentFiles: TFileRepositories["getRecentFiles"] = () =>
  getRecentFilesFromLocalStorage();

const getFileUploadContent: TFileRepositories["getFileUploadContent"] = ({
  conversationMode,
  maxFiles,
  maxSizeInMB,
  acceptFiles,
  t,
}) => {
  const listAcceptFiles = Object.values(acceptFiles)
    .flat()
    .map((ext) => ext.replace(".", ""))
    .join(", ");

  if (conversationMode === EConversationMode.AI_ART) {
    return t("modal.attachFiles.artDesc", {
      listAcceptFiles,
      maxSizeInMB,
      maxfiles: maxFiles,
    });
  }

  return t("modal.attachFiles.desc", {
    listAcceptFiles,
    maxSizeInMB,
    maxfiles: maxFiles,
  });
};

export const fileUseCases = (): TFileRepositories => ({
  addNewFileWithMockId,
  convertFileMessageToSelectedFile,
  filterFilesByConversationMode,
  getFileUploadContent,
  getRecentFiles,
  removeFileByMockId,
  removeRecentFile,
  updateFileUrlByMockId,
});
