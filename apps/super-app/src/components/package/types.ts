import type * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import type { ComponentPropsWithoutRef } from "react";

export type TPackageBadgeLayout = "inline" | "stacked";

export interface IPackageItemProps extends ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> {
  label: string;
  savingText?: string;
  currentText?: string;
  originalPrice?: string;
  currentPrice: string;
  weeklyPrice?: string;
  weeklyPriceLabel?: string;
  badgeLayout?: TPackageBadgeLayout;
  isShowIndicator?: boolean;
}

export type IPackageGroupProps = ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Root
>;
