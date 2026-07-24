import type {
  PromptInputMessage,
  SuitePromptAttachment,
} from "@/features/suite/components/ui/ai-elements/prompt-input";
import type { SuitePromptAttachmentSnapshot } from "@/features/suite/types/conversation";

type UploadedPromptImageAttachment = SuitePromptAttachment & {
  mediaType: string;
  uploadId: string;
  url: string;
};

function isUploadedPromptImageAttachment(
  file: SuitePromptAttachment
): file is UploadedPromptImageAttachment {
  return (
    file.type === "file" &&
    file.mediaType?.startsWith("image/") === true &&
    typeof file.uploadId === "string" &&
    file.uploadId !== "" &&
    typeof file.url === "string" &&
    file.url !== ""
  );
}

export function getPromptAttachmentSnapshots(
  files: PromptInputMessage["files"]
): SuitePromptAttachmentSnapshot[] {
  return files.filter(isUploadedPromptImageAttachment).map((file) => ({
    canvasMeta: file.canvasMeta,
    filename: file.filename,
    id: file.id,
    mediaType: file.mediaType,
    removable: file.removable,
    source: file.source,
    type: file.type,
    uploadId: file.uploadId,
    uploadStatus: file.uploadStatus ?? "completed",
    url: file.url,
  }));
}
