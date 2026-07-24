export interface TSuiteCreativeQuotaDTO {
  daily_limit: number;
  remaining: number;
  // Unix timestamp (seconds) when the quota window resets, sent as a string (e.g. "1781503804").
  // Present only when the quota window is active.
  reset_at?: string;
}
