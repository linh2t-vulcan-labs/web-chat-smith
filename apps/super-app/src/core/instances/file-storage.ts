import type { TFileMessage } from "@/core/models/conversation";
import { uniqBy } from "@/libs/lodash-es";
import { localStorageImpl } from "@/utils/commons/helpers";
import { RECENT_FILES_KEY, USER_ID_KEY } from "@/utils/commons/keys";

const LIMIT_FILE = 9;

const getUserId = () => {
  const userId = localStorageImpl.load<string>(USER_ID_KEY);

  if (!userId) {
    throw new Error("userId not found");
  }

  return userId;
};

const getRecentFilesFromLocalStorage = (): TFileMessage[] => {
  const userId = getUserId();
  const FILE_STORAGE_KEY = `${RECENT_FILES_KEY}-${userId}`;

  const recentFiles = localStorageImpl.load<TFileMessage[]>(FILE_STORAGE_KEY);

  if (!recentFiles) {
    return [];
  }

  return recentFiles;
};

const addRecentFilesToLocalStorage = (files: TFileMessage[]) => {
  const userId = getUserId();
  const FILE_STORAGE_KEY = `${RECENT_FILES_KEY}-${userId}`;

  const recentFiles = getRecentFilesFromLocalStorage();

  const updatedFiles = [...recentFiles, ...files];
  const startPosition =
    updatedFiles.length > LIMIT_FILE ? updatedFiles.length - LIMIT_FILE : 0;
  const acceptedFiles = uniqBy(updatedFiles.slice(startPosition), "fileId");

  localStorageImpl.save<TFileMessage[]>(FILE_STORAGE_KEY, acceptedFiles);

  return acceptedFiles;
};

const removeRecentFilesFromLocalStorage = (fileId: string) => {
  const userId = getUserId();
  const FILE_STORAGE_KEY = `${RECENT_FILES_KEY}-${userId}`;
  const recentFiles = getRecentFilesFromLocalStorage();

  const filterFiles = recentFiles.filter(
    (recentFile) => recentFile.fileId !== fileId
  );

  localStorageImpl.save<TFileMessage[]>(FILE_STORAGE_KEY, filterFiles);

  return filterFiles;
};

export {
  getRecentFilesFromLocalStorage,
  addRecentFilesToLocalStorage,
  removeRecentFilesFromLocalStorage,
};
