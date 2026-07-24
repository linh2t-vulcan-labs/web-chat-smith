import type { SuiteResult } from "@/features/suite/types/http";

import type { SuiteCreativeQuotaModel } from "../quota";

export interface TSuiteCreativeQuotaServiceAPIs {
  getQuota: () => SuiteResult<SuiteCreativeQuotaModel>;
}
