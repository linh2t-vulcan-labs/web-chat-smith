import type { ProductModel } from "@/core/models/product";

export type TSelectedPlanStepProps = Readonly<{
  onCancel?: () => void;
  onConfirm?: (product: ProductModel) => void;
  activeProductId?: string;
  isConfirming?: boolean;
  useTrial?: boolean;
}>;

export type TAmountChangeInfoProps = Readonly<{
  proratedCreditAmount: number;
  proratedCreditCurrency: string;
  oldPlanDurationUnit: string; // e.g., "1 MONTH", "12 MONTHS"
  newPlanPrice: number;
  newPlanCurrency: string;
  newPlanDurationUnit: string; // e.g., "12 MONTHS", "1 MONTH"
  amountDueToday: number;
  amountDueTodayCurrency: string;
  nextBillingCycleDate: string; // ISO date string
  nextBillingAmount: number;
  nextBillingCurrency: string;
}>;

export type TAlertWarningInfoProps = Readonly<{
  newPlanDurationUnit: string; // e.g., "12 MONTHS"
  additionalChargeAmount: number;
  additionalChargeCurrency: string;
  newPlanPrice: number;
  chargeDate: string; // ISO date string
}>;

export type TPreviewChangeStepProps = Readonly<{
  selectedProduct: ProductModel;
  activeProductId?: string;
  paymentSubscriptionId: string;
  onBack?: () => void;
  onCancel?: () => void;
  onConfirm?: (activationDateLabel: string, isUpgrade: boolean) => void;
  // Optional props to override calculated values from API
  amountChangeInfo?: Partial<TAmountChangeInfoProps>;
  alertWarningInfo?: Partial<TAlertWarningInfoProps>;
}>;

export type TSuccessStepProps = Readonly<{
  onCancel?: () => void;
  planDurationLabel?: string;
  activationDateLabel?: string;
  isUpgrade?: boolean;
}>;
