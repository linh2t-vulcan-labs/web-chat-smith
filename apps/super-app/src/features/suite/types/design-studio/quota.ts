import { Exclude, Expose, Transform } from "@/libs/class-transformer";

@Exclude()
export class SuiteCreativeQuotaModel {
  @Expose({ name: "daily_limit" })
  dailyLimit!: number;

  @Expose()
  remaining!: number;

  // Unix timestamp (seconds) when the quota window resets; undefined when the window is inactive.
  // The API sends this as a numeric string, so coerce to a number for arithmetic in the countdown.
  @Expose({ name: "reset_at" })
  @Transform(({ value }) =>
    value === null || value === undefined ? undefined : Number(value)
  )
  resetAt?: number;
}
