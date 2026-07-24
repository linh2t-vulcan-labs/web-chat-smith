import type { ProductModel } from "@/core/models/product";

export type TPackageConfirmChangeInfo = ProductModel & {
  cardInfo: string;
  prorationPrice: number;
  validFrom: string;
};

export interface TOpenConfirmChangePackageModalConfig {
  open: boolean;
  package: TPackageConfirmChangeInfo | null;
  orderId: string | null;
}
