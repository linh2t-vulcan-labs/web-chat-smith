import type { EDURATION_UNIT } from "@/utils/commons/enums";

export interface TProductCardProps {
  title: string;
  originalPrice: string;
  priceWithCurrencySymbol: string;
  durationUnit: EDURATION_UNIT;
  newPricing: boolean;
  isTrial?: boolean;
  useTrial?: boolean;
  price: number;
  perWeek: string;
  onContinue: () => void;
  currencySymbol?: string;
}
