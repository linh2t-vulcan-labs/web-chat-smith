import { EFileExtension, extensionToMimeTypeMap } from "@/utils/constants/file";

export const ACCEPT_FILES_COMMON = {
  [extensionToMimeTypeMap.png]: [`.${EFileExtension.PNG}`],
  [extensionToMimeTypeMap.jpg]: [`.${EFileExtension.JPG}`],
  [extensionToMimeTypeMap.jpeg]: [`.${EFileExtension.JPEG}`],
  [extensionToMimeTypeMap.pdf]: [`.${EFileExtension.PDF}`],
  // "text/html": [".html", ".htm"],
  // "text/csv": [".csv"],
  // "text/plain": [".txt"],
  // "application/json": [".json"],
  // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  // "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
  // "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
};

export const ACCEPT_FILES_AI_ART = {
  [extensionToMimeTypeMap.png]: [`.${EFileExtension.PNG}`],
  [extensionToMimeTypeMap.jpg]: [`.${EFileExtension.JPG}`],
  [extensionToMimeTypeMap.jpeg]: [`.${EFileExtension.JPEG}`],
};
