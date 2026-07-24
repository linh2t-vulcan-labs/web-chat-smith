import { useMemo } from "react";

import type { TFileMessage, TSelectedFile } from "@/core/models/conversation";
import { fileUC } from "@/core/usecases";
import { generateRandomUUIDV4 } from "@/utils/commons/helpers";
import { RECENT_FILES_KEY, USER_ID_KEY } from "@/utils/commons/keys";

import useLocalStorage from "../use-local-storage";

export const useGetRecentFiles = () => {
  const [userId] = useLocalStorage(USER_ID_KEY, "");
  const [recentFiles, setRecentFiles] = useLocalStorage<TFileMessage[]>(
    userId ? `${RECENT_FILES_KEY}-${userId}` : "",
    []
  );

  const removeRecentFile = (fileId: string) => {
    const updatedFiles = fileUC.removeRecentFile(fileId);
    setRecentFiles(updatedFiles);
  };

  const displayFiles: TSelectedFile[] = useMemo(
    () =>
      recentFiles
        .map((recentFiles) => ({
          fileId: recentFiles.fileId,
          fileName: recentFiles.fileName,
          fileSize: recentFiles.fileSize,
          fileUrl: recentFiles.downloadUrl,
          mimeType: recentFiles.fileMimeType,
          mockId: generateRandomUUIDV4(),
        }))
        .toReversed(),
    [recentFiles]
  );

  return {
    displayFiles,
    recentFiles,
    removeRecentFile,
  };
};
