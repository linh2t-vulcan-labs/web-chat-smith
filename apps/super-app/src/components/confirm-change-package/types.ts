import type { ProductModel } from "@/core/models/product";

export interface TConfirmChangePackageProps {
  open: boolean;
  product:
    | (ProductModel & {
        cardInfo: string;
        prorationPrice: number;
        validFrom: string;
      })
    | null;
  confirmButtonTitle?: string;
  cancelButtonTitle?: string;
  onClickConfirm?: () => void;
  onClickCancel?: () => void;
}

export interface TConfirmChangePackageContentProps {
  title: string;
  description?: string;
  price?: string;
  priceClassName?: string;
}
