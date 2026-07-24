import { useTranslations } from "next-intl";

import { Button } from "@/components/button";
import { ModalV2 } from "@/components/modal";

import type { TConfirmChangePackageProps } from "./types";

export default function ConfirmChangePackageModal(
  props: TConfirmChangePackageProps
) {
  const {
    open,
    confirmButtonTitle = "Pay now",
    cancelButtonTitle = "Cancel",
    product,
    onClickCancel,
    onClickConfirm,
  } = props;
  const myPlanT = useTranslations("myPlan");

  const sellingPrice = product?.defaultPrice.price ?? 0;
  const prorationPrice = Math.abs(product?.prorationPrice ?? 0);
  const prorationPriceLabel =
    prorationPrice <= 0 ? 0 : `-${product?.currencySymbol}${prorationPrice}`;

  const totalPrice =
    prorationPrice > sellingPrice ? 0 : sellingPrice - prorationPrice;
  const formattedTotalPrice = Number(totalPrice.toFixed(2)).toLocaleString(
    "en-US",
    {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }
  );

  return (
    <ModalV2
      open={open}
      zIndex={100}
      containerClassName="overflow-hidden max-w-full md:max-w-[calc(100vw-40px)] md:min-w-[422px] bg-surface-general-new-secondary!"
      className="w-[calc(100vw-20px)] p-0! md:w-full"
      isPreventClickOutside
    >
      <div className="text-text-general-secondary w-full">
        <div className="p-medium-3 w-full">
          <h1 className="text-app-Title1 text-start">Confirm changes</h1>
        </div>
        <div className="space-y-medium-3 p-medium-3 thickness-t-thin border-border-input-default flex w-full flex-col">
          <div className="inline-flex flex-col justify-between">
            <div className="space-y-small-1 inline-flex w-full justify-between">
              <p className="text-bodyM-medium">{product?.title}</p>
              <p className="text-bodyM-highlight text-text-general-primary">
                {product?.priceWithCurrencySymbol}
              </p>
            </div>
            <p className="text-bodyS-neutral text-[#818181]">
              Bill {product?.advDurationUnitLabel} | Starting{" "}
              {product?.validFrom}
            </p>
          </div>

          <div className="space-y-small-1 inline-flex flex-col justify-between">
            <p className="text-bodyM-medium">Credit for unused time</p>
            <div className="inline-flex w-full justify-between">
              <p className="text-bodyS-neutral text-[#818181]">
                From current package
              </p>
              <p className="text-bodyM-highlight text-text-inputControl-highlight-default">
                {prorationPriceLabel}
              </p>
            </div>
          </div>
        </div>
        <div className="p-medium-3 thickness-t-thin border-border-input-default flex w-full items-center justify-between gap-[12px]">
          <h3 className="text-bodyM-medium">Total due today</h3>
          <p className="text-app-Title1 text-text-general-primary">
            {product?.currencySymbol}
            {formattedTotalPrice}
          </p>
        </div>
        <div className="space-y-small-1 py-medium-2.5 px-medium-3 thickness-t-thin border-border-input-default flex w-full flex-col">
          <p className="text-bodyM-medium">
            {" "}
            {myPlanT("invoice.paymentMethod")}
          </p>
          <div className="inline-flex justify-between">
            <p className="text-bodyS-neutral text-[#818181]">Credit card</p>
            <p className="text-bodyS-highlight">{product?.cardInfo}</p>
          </div>
        </div>

        <div className="py-medium-2.5 px-medium-3 space-x-medium-3 flex w-full items-center justify-between">
          <Button
            color="neutral"
            className="w-full"
            size="baseIcon"
            onClick={onClickCancel}
          >
            {cancelButtonTitle}
          </Button>
          <Button
            color="primary"
            className="w-full"
            size="baseIcon"
            onClick={onClickConfirm}
          >
            {confirmButtonTitle}
          </Button>
        </div>
      </div>
    </ModalV2>
  );
}
