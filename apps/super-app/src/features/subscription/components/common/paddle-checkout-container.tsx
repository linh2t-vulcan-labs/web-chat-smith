import React from "react";

import { ECheckoutStep } from "@/components/account-subscription-modal-v4";
import { PADDLE_CONTAINER_CLASSNAME } from "@/libs/paddle-js/constants";
import { useGlobalState } from "@/store/global/hooks";
import { compositeStyles } from "@/utils/commons/styles";

interface PaddleCheckoutContainerProps {
  readonly wrapperClassName?: string;
  readonly contentWrapperClassName?: string;
  readonly contentClassName?: string;
  readonly visibleZIndexClassName?: string;
  readonly renderHeader?: () => React.ReactNode;
  /** When true, container participates in document flow and has no inner scroll; view zone scrolls instead. */
  readonly embedInFlow?: boolean;
}

export function PaddleCheckoutContainer({
  wrapperClassName,
  contentWrapperClassName,
  contentClassName,
  visibleZIndexClassName = "z-[99]",
  renderHeader,
  embedInFlow = false,
}: PaddleCheckoutContainerProps) {
  const checkoutStep = useGlobalState((state) => state.checkoutStep);

  const isPaddleCheckoutLoaded =
    checkoutStep === ECheckoutStep.PAYMENT_CHECKOUT;

  return (
    <div
      className={compositeStyles(
        "gap-medium-2 rounded-default flex w-full flex-col bg-white transition-all duration-300 ease-in-out",
        embedInFlow ? "flex-1" : "absolute inset-0",
        wrapperClassName,
        isPaddleCheckoutLoaded
          ? compositeStyles(visibleZIndexClassName, "scale-100 opacity-100")
          : "pointer-events-none z-[-1] scale-95 opacity-0"
      )}
    >
      {renderHeader?.()}

      <div
        className={compositeStyles(
          "flex w-full flex-col",
          embedInFlow
            ? "min-h-[calc(100dvh-220px)] flex-1"
            : "min-h-[448px] items-center justify-center",
          contentWrapperClassName
        )}
      >
        <div
          className={compositeStyles(
            "w-full",
            embedInFlow
              ? "max-h-full"
              : "max-h-full overflow-y-auto lg:max-h-[488px]",
            PADDLE_CONTAINER_CLASSNAME.PADDLE_CHECKOUT_CONTAINER,
            contentClassName
          )}
        />
      </div>
    </div>
  );
}
