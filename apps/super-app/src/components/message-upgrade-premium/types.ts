import type { TPurchaseSource } from "@/utils/commons/types";

export interface TMessageUpgradePremiumProps {
  title?: string;
  description?: string | React.ReactNode;
  purchaseSource?: TPurchaseSource;
}
