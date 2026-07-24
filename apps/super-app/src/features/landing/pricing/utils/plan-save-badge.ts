import type { useTranslations } from "next-intl";

import type { ProductModel } from "@/core/models/product";
import { calculateDiscountPercentage } from "@/utils/commons/helpers";

/** Save badge label — same calculation as PricingRadioGroupItem. */
export function getPlanSaveBadgeLabel(
  product: ProductModel,
  dsT: ReturnType<typeof useTranslations>
): string | null {
  const percent = calculateDiscountPercentage(
    product.originalPrice,
    product.defaultPrice.price,
    product.currencySymbol
  );

  if (!percent) {
    return null;
  }

  return `${dsT("badge.saveText")} ${percent}%`;
}
