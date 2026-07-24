import { Skeleton } from "@/components/skeleton";

import { MyPlanSectionItemContainer } from "../../my-plan-section-item-container";

const TAG_CLASSNAME = "w-[60px] h-[20px]";
const TITLE_CLASSNAME = "w-[160px] h-[20px]";
const BADGE_CLASSNAME = "w-[60px] h-[20px]";
const TRIGGER_CLASSNAME = "h-[12px] w-[66px] md:w-[160px]";
const PRICE_CLASSNAME = "h-[20px] w-[100px]";
const TIMELINE_TITLE = "h-[12px] w-[240px]";
const TIMELINE_DESCRIPTION = "h-[12px] w-[326px] md:w-[480px]";
const CANCEL_ACTION_BUTTON = "h-[40px] w-[144px]";
const PRIMARY_ACTION_BUTTON = "h-[40px] w-[240px]";

export default function SubscriptionCardInfoSkeleton() {
  return (
    <MyPlanSectionItemContainer>
      <Skeleton className={TAG_CLASSNAME} />
      <div className="flex w-full items-center justify-between">
        <div className="gap-v1-structural-content-tight flex w-full items-start">
          <Skeleton className={TITLE_CLASSNAME} />
          <Skeleton className={BADGE_CLASSNAME} />
        </div>
        <Skeleton className={TRIGGER_CLASSNAME} />
      </div>

      <Skeleton className={PRICE_CLASSNAME} />

      <div className="gap-v1-structural-content-tight flex w-full flex-col">
        <Skeleton className={TIMELINE_TITLE} />
        <Skeleton className={TIMELINE_DESCRIPTION} />
        <Skeleton className={TIMELINE_TITLE} />
        <Skeleton className={TIMELINE_DESCRIPTION} />
      </div>

      <div className="gap-v1-structural-content-micro flex w-full justify-start md:justify-end">
        <Skeleton className={CANCEL_ACTION_BUTTON} />
        <Skeleton className={PRIMARY_ACTION_BUTTON} />
      </div>
    </MyPlanSectionItemContainer>
  );
}
