import type { TResult } from "../models/http";
import type { TChatFreeUsage, TFreeUsageReset } from "../models/usage";

export interface TUsageServiceAPIs {
  getFreeUsageCount: () => TResult<TChatFreeUsage>;
  getFreeUsageResetInfo: () => TResult<TFreeUsageReset>;
  updateFreeUsageCount: () => TResult<object>;
  initializeFreeUsage: () => TResult<object>;
  resetFreeUsage: () => TResult<object>;
}
