import type {
  TSuiteCreativeMessageDTO,
  TSuiteCreativeUploadStatus,
} from "@/features/suite/types/design-studio";

export const MESSAGE_ROLE_MAP: Record<
  string,
  TSuiteCreativeMessageDTO["role"]
> = {
  MESSAGE_ROLE_ASSISTANT: "assistant",
  MESSAGE_ROLE_USER: "user",
};

export const MESSAGE_STATUS_MAP: Record<
  string,
  TSuiteCreativeMessageDTO["status"]
> = {
  MESSAGE_STATUS_CANCELLED: "cancelled",
  MESSAGE_STATUS_DONE: "done",
  MESSAGE_STATUS_FAILED: "failed",
  MESSAGE_STATUS_PENDING: "pending",
  MESSAGE_STATUS_PROCESSING: "processing",
};

export const UPLOAD_STATUS_MAP: Record<string, TSuiteCreativeUploadStatus> = {
  UPLOAD_STATUS_COMPLETED: "completed",
  UPLOAD_STATUS_FAILED: "failed",
  UPLOAD_STATUS_PENDING: "pending",
};
