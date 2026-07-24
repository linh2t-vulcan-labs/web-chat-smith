import { Exclude, Expose } from "@/libs/class-transformer";

export type TSuiteCreativeTemplateCategory = "logo";

@Exclude()
export class SuiteCreativeTemplateModel {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose({ name: "thumbnail_url" })
  thumbnailUrl!: string;

  @Expose({ name: "image_url" })
  imageUrl!: string;

  @Expose()
  category!: TSuiteCreativeTemplateCategory;

  @Expose()
  tags!: string[];

  @Expose({ name: "sort_order" })
  sortOrder!: number;
}

export interface TSuiteCreativeListTemplatesInput {
  category?: TSuiteCreativeTemplateCategory;
  pageSize?: number;
  pageToken?: string | null;
}

export type TSuiteCreativeListTemplatesQueryInput = Omit<
  TSuiteCreativeListTemplatesInput,
  "pageToken"
>;

export interface TSuiteCreativeListTemplatesResult {
  templates: SuiteCreativeTemplateModel[];
  nextPageToken: string | null;
}
