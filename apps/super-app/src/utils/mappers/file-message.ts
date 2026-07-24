import type { TFileMessage, TSelectedFile } from "@/core/models/conversation";

import { getMimeTypeFromFile } from "../commons/helpers";

// Leaf mapper extracted from ./conversations to break the
// mappers/conversations ⇄ domain/usecases circular import (Turbopack module-eval
// order surfaced it as "Cannot read properties of undefined" on Next 16).
export const mappingDisplayFileToTempFileMessage = (
  displayFile: TSelectedFile
): TFileMessage => ({
  downloadUrl: `${displayFile.fileUrl}`,
  fileId: `${displayFile.fileId}`,
  fileMimeType: getMimeTypeFromFile(displayFile.fileName, displayFile.mimeType),
  fileName: displayFile.fileName,
  fileSize: displayFile.fileSize,
});
