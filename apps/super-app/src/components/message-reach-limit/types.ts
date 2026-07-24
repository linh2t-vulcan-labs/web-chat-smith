import type { TPurchaseSource } from "@/utils/commons/types";

export interface TMessageReachLimit {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actionNode?: React.ReactNode;
  purchaseSource?: TPurchaseSource;
}
