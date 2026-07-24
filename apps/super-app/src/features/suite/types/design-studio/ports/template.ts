import type { SuiteResult } from "@/features/suite/types/http";

import type {
  TSuiteCreativeListTemplatesInput,
  TSuiteCreativeListTemplatesResult,
} from "../template";

export interface TSuiteCreativeTemplateServiceAPIs {
  listTemplates: (
    input?: TSuiteCreativeListTemplatesInput
  ) => SuiteResult<TSuiteCreativeListTemplatesResult>;
}
