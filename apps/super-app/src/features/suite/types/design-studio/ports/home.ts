import type { SuiteResult } from "@/features/suite/types/http";

import type {
  TSuiteCreativeGetCreateLogoStructureResult,
  TSuiteCreativeGetHomeSuggestionsResult,
} from "../home";

export interface TSuiteCreativeHomeServiceAPIs {
  getHomeSuggestions: () => SuiteResult<TSuiteCreativeGetHomeSuggestionsResult>;
  getCreateLogoStructure: () => SuiteResult<TSuiteCreativeGetCreateLogoStructureResult>;
}
