import type { SuiteResult } from "@/features/suite/types/http";

import type {
  SuiteCreativeImageExportModel,
  TSuiteCreativeExportImageInput,
  TSuiteCreativeListImagesInput,
  TSuiteCreativeListImagesResult,
} from "../image";

export interface TSuiteCreativeImageServiceAPIs {
  listImages: (
    input: TSuiteCreativeListImagesInput
  ) => SuiteResult<TSuiteCreativeListImagesResult>;
  exportImage: (
    input: TSuiteCreativeExportImageInput
  ) => SuiteResult<SuiteCreativeImageExportModel>;
}
