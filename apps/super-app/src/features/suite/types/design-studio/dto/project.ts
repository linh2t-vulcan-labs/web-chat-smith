import { Expose } from "@/libs/class-transformer";

export interface TSuiteCreativeProjectDTO {
  id: string;
  user_id: string;
  title: string;
  cover_image_url: string;
  created_at: string;
  updated_at: string;
}

export class SuiteCreativeCreateProjectPayloadDTO {
  @Expose()
  title!: string;
}

export class SuiteCreativeListProjectsQueryDTO {
  @Expose({ name: "pageSize" })
  page_size?: number;

  @Expose({ name: "pageToken" })
  page_token?: string | null;
}

export class SuiteCreativeRenameProjectPayloadDTO {
  @Expose()
  title!: string;
}

export interface TSuiteCreativeCreateProjectResponseDTO {
  project: TSuiteCreativeProjectDTO;
}

export interface TSuiteCreativeListProjectsResponseDTO {
  projects: TSuiteCreativeProjectDTO[];
  next_page_token: string | null;
}

export interface TSuiteCreativeGetProjectResponseDTO {
  project: TSuiteCreativeProjectDTO;
}

export type TSuiteCreativeRenameProjectResponseDTO = TSuiteCreativeProjectDTO;

export type TSuiteCreativeDeleteProjectResponseDTO = Record<string, never>;
