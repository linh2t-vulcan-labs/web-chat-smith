import type { EDURATION_UNIT } from "@/utils/commons/enums";

export interface TProductCardTier3Props {
  title: string;
  durationUnit: EDURATION_UNIT;
  originalPrice: string;
  price: number;
  perWeek: string;
  newPricing?: boolean;
  isTrial?: boolean;
  useTrial?: boolean;
  onContinue: () => void;
  currencySymbol?: string;
  durationUnitLabel?: string;
}
