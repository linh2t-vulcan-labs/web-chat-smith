import { useTranslations } from "next-intl";
import React from "react";

import { SVGIcon } from "@/components/svg-icon";
import { PADDLE_CONTAINER_CLASSNAME } from "@/libs/paddle-js/constants";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

import { ECheckoutStep } from "./types";

export const PaddleCheckoutContainer: React.FC = () => {
  const dsT = useTranslations("ds");
  const checkoutStep = useGlobalState((state) => state.checkoutStep);

  const isPaddleCheckoutLoaded =
    checkoutStep === ECheckoutStep.PAYMENT_CHECKOUT;

  const resetCheckoutFlow = useGlobalState((state) => state.resetCheckoutFlow);

  const handleBack = () => {
    resetCheckoutFlow();
  };

  return (
    <div
      className={compositeStyles(
        "gap-medium-2 px-large-4 py-medium-2 md:rounded-default absolute inset-0 flex w-full flex-col bg-white transition-all duration-300 ease-in-out",
        isPaddleCheckoutLoaded
          ? "z-99 scale-100 opacity-100"
          : "pointer-events-none z-[-1] scale-95 opacity-0"
      )}
    >
      {/* Header with back button */}
      <div className="gap-medium-3 flex items-center">
        <button
          type="button"
          onClick={handleBack}
          className="gap-small-2 text-text-general-tertiary hover:text-text-general-secondary flex cursor-pointer items-center transition-colors"
        >
          <SVGIcon
            src="/icons/outlined/arrow-left.svg"
            width={20}
            height={20}
          />
          <span className="text-body-2 font-medium">{dsT("backToPlans")}</span>
        </button>
      </div>

      {/* Paddle Checkout Container */}
      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <div
          className={compositeStyles(
            "max-h-full w-full overflow-y-auto lg:max-h-[574px]",
            PADDLE_CONTAINER_CLASSNAME.PADDLE_CHECKOUT_CONTAINER
          )}
        />
      </div>
    </div>
  );
};
