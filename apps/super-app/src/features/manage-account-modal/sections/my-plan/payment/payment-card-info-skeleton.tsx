import { Skeleton } from "@/components/skeleton";

const CARD_IMAGE_SKELETON_CLASSNAME = "h-[24px] w-[36px] rounded-sm";
const CARD_NUMBER_SKELETON_CLASSNAME = "h-small-1 w-[160px]";
const CARDHOLDER_SKELETON_CLASSNAME = "h-small-1 w-[120px]";
const EXPIRY_SKELETON_CLASSNAME = "h-small-1 w-[140px]";
const ACTION_TRIGGER_SKELETON_CLASSNAME = "h-[16px] w-[16px] rounded-sm";

export function PaymentCardInfoSkeleton() {
  return (
    <div className="gap-small-1 flex h-fit w-full items-start">
      <div className="flex h-full w-9 items-center justify-center">
        <Skeleton className={CARD_IMAGE_SKELETON_CLASSNAME} />
      </div>
      <div className="gap-small-0.5 flex w-full flex-1 flex-col">
        <Skeleton className={CARD_NUMBER_SKELETON_CLASSNAME} />
        <Skeleton className={CARDHOLDER_SKELETON_CLASSNAME} />
        <Skeleton className={EXPIRY_SKELETON_CLASSNAME} />
      </div>
      <Skeleton className={ACTION_TRIGGER_SKELETON_CLASSNAME} />
    </div>
  );
}
