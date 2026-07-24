import { Exclude, Expose } from "@/libs/class-transformer";

export type TSuiteCreativeUploadContentType = "image/png" | "image/jpeg";

export type TSuiteCreativeUploadStatus = "pending" | "completed" | "failed";

@Exclude()
export class SuiteCreativeUploadModel {
  @Expose()
  id!: string;

  @Expose({ name: "user_id" })
  userId!: string;

  @Expose({ name: "project_id" })
  projectId?: string;

  @Expose()
  filename!: string;

  @Expose({ name: "content_type" })
  contentType!: TSuiteCreativeUploadContentType;

  @Expose({ name: "size_bytes" })
  sizeBytes!: number;

  @Expose()
  status!: TSuiteCreativeUploadStatus;

  @Expose({ name: "upload_url" })
  uploadUrl!: string;

  @Expose({ name: "download_url" })
  downloadUrl!: string;

  @Expose({ name: "created_at" })
  createdAt!: string;

  @Expose({ name: "expires_at" })
  expiresAt!: string;

  uploadPolicy?: Record<string, string>;
}

export interface TSuiteCreativeCreateUploadInput {
  projectId?: string;
  filename: string;
  contentType: TSuiteCreativeUploadContentType;
  sizeBytes: number;
  displayOnly?: boolean;
}

export interface TSuiteCreativeGetUploadInput {
  uploadId: string;
}

export interface TSuiteCreativeCompleteUploadInput {
  uploadId: string;
  downloadUrl: string;
}

export interface TSuiteCreativeGetUploadOptions {
  enabled?: boolean;
}

export interface TSuiteCreativeUploadFileInput {
  file: File;
  projectId?: string;
  displayOnly?: boolean;
}

export interface TSuiteCreativeUploadFileResult {
  downloadUrl: string;
  uploadId: string;
}

export interface TSuiteCreativeListUploadsInput {
  pageSize?: number;
  pageToken?: string | null;
}

// Hook input (the cursor is supplied by the paginator, not the caller).
export type TSuiteCreativeListUploadsQueryInput = Omit<
  TSuiteCreativeListUploadsInput,
  "pageToken"
>;

export interface TSuiteCreativeListUploadsResult {
  uploads: SuiteCreativeUploadModel[];
  nextPageToken: string;
}
