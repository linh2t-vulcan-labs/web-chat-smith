import type { TManageSubscriptionItem } from "../types";

export type TUpgradeDowngradePlanModalProps = Readonly<{
  open: boolean;
  item: TManageSubscriptionItem;
  step: TUpgradeDowngradePlanStep;
  onChangeStep: (step: TUpgradeDowngradePlanStep) => void;
  onClose: () => void;
}>;

export type TUpgradeDowngradePlanStep =
  | "selected-plan"
  | "preview-change"
  | "success";
