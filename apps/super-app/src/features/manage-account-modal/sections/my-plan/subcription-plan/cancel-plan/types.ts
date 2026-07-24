import type { TManageSubscriptionItem } from "../types";

export type TCancelPlanModalProps = Readonly<{
  open: boolean;
  status: "inProgress" | "success" | "uncancelled";
  item: TManageSubscriptionItem;
  isConfirming?: boolean;
  onClose: () => void;
  onConfirm?: (subscriptionId: string) => void;
}>;

export type TInProgressCancelContentProps = Readonly<{
  expiredAt: string;
}>;

export type TSuccessCancelContentProps = Readonly<{
  expiredAt: string;
  onClose: () => void;
}>;
