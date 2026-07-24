import { Exclude, Expose } from "@/libs/class-transformer";

export type TSuiteCreativeImageFormat = "PNG" | "JPEG" | "WEBP";

@Exclude()
export class SuiteCreativeImageModel {
  @Expose()
  id!: string;

  @Expose({ name: "project_id" })
  projectId!: string;

  @Expose({ name: "message_id" })
  messageId!: string;

  @Expose()
  format!: TSuiteCreativeImageFormat;

  @Expose()
  width!: number;

  @Expose()
  height!: number;

  @Expose({ name: "download_url" })
  downloadUrl!: string;

  @Expose({ name: "created_at" })
  createdAt!: string;
}

@Exclude()
export class SuiteCreativeImageExportModel {
  @Expose({ name: "download_url" })
  downloadUrl!: string;
}

export interface TSuiteCreativeListImagesInput {
  projectId: string;
  pageSize?: number;
  pageToken?: string | null;
}

export type TSuiteCreativeListImagesQueryInput = Omit<
  TSuiteCreativeListImagesInput,
  "pageToken"
>;

export interface TSuiteCreativeExportImageInput {
  projectId: string;
  imageId: string;
  format: TSuiteCreativeImageFormat;
}

export interface SuiteCreativeImageGroupModel {
  messageId: string;
  images: SuiteCreativeImageModel[];
  // The reference/template image this turn was generated from (e.g. a template-based prompt). Null
  // for plain text-to-image turns.
  template: SuiteCreativeImageModel | null;
}

export interface TSuiteCreativeListImagesResult {
  images: SuiteCreativeImageModel[];
  groups: SuiteCreativeImageGroupModel[];
  nextPageToken: string | null;
}
