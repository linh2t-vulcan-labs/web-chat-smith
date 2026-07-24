import { Expose } from "class-transformer";
import dayjs from "dayjs";

export interface TChatFreeUsage {
  chat: number;
  assistant: number;
  file: number;
  deepResearch: number;
  imageCreation: number;
  webSearch: number;
}

export interface TFreeUsageReset {
  chat: FreeUsageResetModel | null;
  assistant: FreeUsageResetModel | null;
  file: FreeUsageResetModel | null;
  deepResearch: FreeUsageResetModel | null;
  imageCreation: FreeUsageResetModel | null;
  webSearch: FreeUsageResetModel | null;
}

// class FreeUsageCountModel {
//   @Expose({ name: "user_id" })
//   userId!: string;

//   @Expose({ name: "remaining_count" })
//   remainingCount!: number;

//   @Expose({ name: "use_case" })
//   usecase!: string;

//   @Expose({ name: "created_at" })
//   createdAt!: string;

//   @Expose({ name: "updated_at" })
//   updatedAt!: string;
// }

export class FreeUsageResetModel {
  @Expose({ name: "user_id" })
  userId!: string;

  @Expose({ name: "use_case" })
  usecase!: string;

  @Expose({ name: "status" })
  status!: string;

  @Expose({ name: "reset_count" })
  resetCount!: number;

  @Expose({ name: "can_reset" })
  canReset!: boolean;

  @Expose({ name: "period_start" })
  periodStart!: string;

  @Expose({ name: "period_end" })
  periodEnd!: string;

  @Expose({ name: "last_reset_at" })
  lastResetAt!: string;

  @Expose({ name: "created_at" })
  createdAt!: string;

  @Expose({ name: "updated_at" })
  updatedAt!: string;

  /**
   * periodEnd from API is 00:00 of day N, so last day of current period is
   * N-1. A plain method (not a getter) so it isn't picked up as a
   * serializable field by TransformerBuilder's getter-scan.
   */
  private getLogicalPeriodEnd() {
    return dayjs(this.periodEnd).subtract(1, "day");
  }

  get isWithinPeriod(): boolean {
    const now = dayjs();
    const start = dayjs(this.periodStart);
    const end = this.getLogicalPeriodEnd().endOf("day");
    return !now.isBefore(start) && !now.isAfter(end);
  }

  get isLastDayOfPeriod(): boolean {
    return dayjs().isSame(this.getLogicalPeriodEnd(), "day");
  }
}
