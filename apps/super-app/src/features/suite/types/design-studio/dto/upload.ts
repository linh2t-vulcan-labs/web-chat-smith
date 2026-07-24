import { Expose } from "@/libs/class-transformer";

import type { TSuiteCreativeUploadContentType } from "../upload";

export interface TSuiteCreativeUploadDTO {
  id: string;
  user_id: string;
  project_id?: string;
  filename: string;
  content_type: TSuiteCreativeUploadContentType;
  size_bytes: number;
  status: string;
  upload_url: string;
  upload_policy?: Record<string, string>;
  download_url: string;
  created_at: string;
  expires_at: string;
}

export class SuiteCreativeCreateUploadPayloadDTO {
  @Expose({ name: "projectId" })
  project_id?: string;

  @Expose()
  filename!: string;

  @Expose({ name: "contentType" })
  content_type!: TSuiteCreativeUploadContentType;

  @Expose({ name: "sizeBytes" })
  size_bytes!: number;

  @Expose({ name: "displayOnly" })
  display_only?: boolean;
}

export class SuiteCreativeCompleteUploadPayloadDTO {
  @Expose({ name: "downloadUrl" })
  download_url!: string;
}

export class SuiteCreativeListUploadsQueryDTO {
  @Expose({ name: "pageSize" })
  page_size?: number;

  @Expose({ name: "pageToken" })
  page_token?: string | null;
}

export interface TSuiteCreativeCreateUploadResponseDTO {
  upload: TSuiteCreativeUploadDTO;
}

export interface TSuiteCreativeGetUploadResponseDTO {
  upload: TSuiteCreativeUploadDTO;
}

export interface TSuiteCreativeCompleteUploadResponseDTO {
  upload: TSuiteCreativeUploadDTO;
}

export interface TSuiteCreativeListUploadsResponseDTO {
  uploads: TSuiteCreativeUploadDTO[];
  next_page_token: string;
}
