import { Exclude, Expose } from "@/libs/class-transformer";

@Exclude()
export class SuiteCreativeProjectModel {
  @Expose()
  id!: string;

  @Expose({ name: "user_id" })
  userId!: string;

  @Expose()
  title!: string;

  @Expose({ name: "cover_image_url" })
  coverImageUrl!: string;

  @Expose({ name: "created_at" })
  createdAt!: string;

  @Expose({ name: "updated_at" })
  updatedAt!: string;
}

export interface TSuiteCreativeCreateProjectInput {
  title: string;
}

export interface TSuiteCreativeListProjectsInput {
  pageSize?: number;
  pageToken?: string | null;
}

export type TSuiteCreativeListProjectsQueryInput = Omit<
  TSuiteCreativeListProjectsInput,
  "pageToken"
>;

export interface TSuiteCreativeGetProjectInput {
  projectId: string;
}

export interface TSuiteCreativeRenameProjectInput {
  projectId: string;
  title: string;
}

export interface TSuiteCreativeDeleteProjectInput {
  projectId: string;
}

export interface TSuiteCreativeListProjectsResult {
  projects: SuiteCreativeProjectModel[];
  nextPageToken: string | null;
}
