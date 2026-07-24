import { Expose } from "@/libs/class-transformer";

import type { TSuiteCreativeTemplateCategory } from "../template";

export interface TSuiteCreativeTemplateDTO {
  id: string;
  name: string;
  thumbnail_url: string;
  category: TSuiteCreativeTemplateCategory;
  tags: string[];
  sort_order: number;
}

export class SuiteCreativeListTemplatesQueryDTO {
  @Expose()
  category?: TSuiteCreativeTemplateCategory;

  @Expose({ name: "pageSize" })
  page_size?: number;

  @Expose({ name: "pageToken" })
  page_token?: string | null;
}

export interface TSuiteCreativeListTemplatesResponseDTO {
  templates: TSuiteCreativeTemplateDTO[];
  next_page_token: string | null;
}
