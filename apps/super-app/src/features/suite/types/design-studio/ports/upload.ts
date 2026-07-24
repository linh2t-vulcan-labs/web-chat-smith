import type { SuiteResult } from "@/features/suite/types/http";

import type {
  SuiteCreativeUploadModel,
  TSuiteCreativeCompleteUploadInput,
  TSuiteCreativeCreateUploadInput,
  TSuiteCreativeGetUploadInput,
  TSuiteCreativeListUploadsInput,
  TSuiteCreativeListUploadsResult,
} from "../upload";

export interface TSuiteCreativeUploadServiceAPIs {
  createUpload: (
    input: TSuiteCreativeCreateUploadInput
  ) => SuiteResult<SuiteCreativeUploadModel>;
  getUpload: (
    input: TSuiteCreativeGetUploadInput
  ) => SuiteResult<SuiteCreativeUploadModel>;
  completeUpload: (
    input: TSuiteCreativeCompleteUploadInput
  ) => SuiteResult<SuiteCreativeUploadModel>;
  listUploads: (
    input: TSuiteCreativeListUploadsInput
  ) => SuiteResult<TSuiteCreativeListUploadsResult>;
}
