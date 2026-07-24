import type { ChatInputDTO } from "@/core/http/dto/conversation";
import type { TSelectedFile } from "@/core/models/conversation";

import { downloadFileFromBlob } from "../commons/helpers";
import { EFileExtension, extensionToMimeTypeMap } from "../constants/file";

async function clientExportFile(
  fileName: string,
  fileExtension: EFileExtension,
  content: string
): Promise<void> {
  const response = await fetch("/api/export", {
    body: JSON.stringify({ content, type: fileExtension }),
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  const blob = await response.blob();

  downloadFileFromBlob(blob, `${fileName}.${fileExtension}`);
}

function detectMimeType(fileType: EFileExtension): string {
  return extensionToMimeTypeMap[fileType];
}

async function convertHtmlToDocx(content: string): Promise<ArrayBuffer | null> {
  const { exportHtmlToDocx } = await import("../../libs/html-to-docx");
  return await exportHtmlToDocx(content);
}

async function convertImageUrlToArrayBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch image: ${response.status} ${response.statusText}`
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return arrayBuffer;
}

function processFileInRouteHandler(
  content: string,
  type: EFileExtension
): Promise<ArrayBuffer | null> {
  const objMapper: Partial<
    Record<EFileExtension, (content: string) => Promise<ArrayBuffer | null>>
  > = {
    [EFileExtension.DOCX]: convertHtmlToDocx,
    [EFileExtension.JPEG]: convertImageUrlToArrayBuffer,
  };

  if (!objMapper[type]) {
    return Promise.resolve(null);
  }

  return objMapper[type]?.(content) ?? Promise.resolve(null);
}

/**
 * Detects whether the provided list of files contains any PDF or image files.
 *
 * @param files - An array of selected files to check for PDF and image types.
 * @returns An object indicating the presence of PDF (`hasPdf`) and image (`hasImg`) files.
 */
function detectFileTypesFromFiles(files: TSelectedFile[]): {
  hasPdf: boolean;
  hasImg: boolean;
} {
  let hasPdf = false;
  let hasImg = false;

  for (const file of files) {
    if (file.mimeType === extensionToMimeTypeMap.pdf) {
      hasPdf = true;
    }
    if (file.mimeType?.startsWith("image/")) {
      hasImg = true;
    }
  }

  return { hasImg, hasPdf };
}

/**
 * Detects the presence of PDF and image file types in the attachments of the last message in a chat input.
 *
 * @param chatInput - The chat input data transfer object containing messages and their attachments.
 * @returns An object indicating whether a PDF (`hasPdf`) or image (`hasImg`) file type is present in the attachments.
 */
function detectFileTypesFromChatInput(chatInput: ChatInputDTO): {
  hasPdf: boolean;
  hasImg: boolean;
} {
  let hasPdf = false;
  let hasImg = false;

  const attachments = chatInput?.messages.at(-1)?.attachments ?? [];

  for (const attachment of attachments) {
    if (attachment.mime_type === extensionToMimeTypeMap.pdf) {
      hasPdf = true;
    } else if (attachment.mime_type?.startsWith("image/")) {
      hasImg = true;
    }
  }

  return { hasImg, hasPdf };
}

/**
 * Detects the presence of PDF and image files from the provided input and invokes a callback with the results.
 *
 * The input can be either an array of selected files (`TSelectedFile[]`) or a chat input data transfer object (`ChatInputDTO`).
 * The function determines the types of files present and calls the provided callback with two boolean values:
 * - `hasPdf`: Indicates if at least one PDF file is present.
 * - `hasImg`: Indicates if at least one image file is present.
 *
 * @param input - The input to check for file types, either an array of selected files or a chat input DTO.
 * @param callback - A function to be called with the results of the detection (`hasPdf`, `hasImg`).
 */
function handleDetectFileTypes(
  input: TSelectedFile[] | ChatInputDTO,
  callback: (hasPdf: boolean, hasImg: boolean) => void
) {
  const result: { hasPdf: boolean; hasImg: boolean } = Array.isArray(input)
    ? detectFileTypesFromFiles(input)
    : detectFileTypesFromChatInput(input);

  callback(result.hasPdf, result.hasImg);
}

/**
 * Detects a general file type based on the provided MIME type string.
 *
 * @param mimeType - The MIME type of the file (e.g., 'image/png', 'application/pdf').
 * @returns Returns 'image' if the MIME type starts with 'image/', 'pdf' if it is 'application/pdf',
 *          or the original MIME type string if it does not match known types.
 */
function detectFileTypeFromMimeType(mimeType: string): string {
  if (mimeType.startsWith("image/")) {
    return "image";
  } else if (mimeType === "application/pdf") {
    return "pdf";
  }
  return mimeType;
}

export const FileManager = {
  clientExportFile,
  detectFileTypeFromMimeType,
  detectMimeType,
  handleDetectFileTypes,
  processFileInRouteHandler,
};
