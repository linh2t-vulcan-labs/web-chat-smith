import { Expose } from "@/libs/class-transformer";

import type { TSuiteCreativeImageFormat } from "../image";

export interface TSuiteCreativeImageDTO {
  id: string;
  project_id: string;
  message_id: string;
  storage_path?: string;
  format: TSuiteCreativeImageFormat;
  width: number;
  height: number;
  download_url: string;
  created_at: string;
}

export interface TSuiteCreativeImageGroupDTO {
  message_id: string;
  images: TSuiteCreativeImageDTO[];
  template?: TSuiteCreativeImageDTO | null;
}

export class SuiteCreativeListImagesQueryDTO {
  @Expose({ name: "pageSize" })
  page_size?: number;

  @Expose({ name: "pageToken" })
  page_token?: string | null;
}

export class SuiteCreativeExportImagePayloadDTO {
  @Expose()
  format!: TSuiteCreativeImageFormat;
}

export interface TSuiteCreativeListImagesResponseDTO {
  images: TSuiteCreativeImageDTO[];
  groups: TSuiteCreativeImageGroupDTO[];
  next_page_token: string | null;
}

export interface TSuiteCreativeExportImageResponseDTO {
  download_url: string;
}
