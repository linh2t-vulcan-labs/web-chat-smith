import { useTheme } from "@wrksz/themes/client";
import React from "react";

import type { ProductModel } from "@/core/models/product";
import { useMobileV2Checkout } from "@/hooks/subscriptions/use-mobile-v2-checkout";
import {
  PADDLE_CONTAINER_CLASSNAME,
  PADDLE_EXPRESS_INLINE_OPTS,
  PADDLE_THEME,
} from "@/libs/paddle-js/constants";

import { MobileCheckoutPolicyFooter } from "./mobile-checkout-policy-footer";
import { PaddleExpressCheckoutButton } from "./paddle-express-checkout-button";

interface TMobileExpressCheckoutProps {
  product?: ProductModel;
}

/**
 * V2 mobile **express** checkout — Apple Pay + "Pay another way" (Card) inline iframe.
 * Rendered only when the V2 flag is on, on iOS with Apple Pay available (the only case that
 * auto-opens the Paddle iframe; everything else uses the Continue-button flow). Uses the
 * open-once + updateItems core ({@link useMobileV2Checkout}).
 */
export const MobileExpressCheckout: React.FC<TMobileExpressCheckoutProps> = ({
  product,
}) => {
  const { theme } = useTheme();

  const { checkoutState, isUpdatingPlan } = useMobileV2Checkout(product, {
    container: PADDLE_CONTAINER_CLASSNAME.PADDLE_EXPRESS_BUTTON_CONTAINER,
    flow: "expressCheckout",
    paddleOpts: {
      ...PADDLE_EXPRESS_INLINE_OPTS,
      frameStyle:
        "background-color: transparent; border: none; width: 100%; min-width: 312px;",
      initialHeight: 250,
      theme: theme === "dark" ? PADDLE_THEME.DARK : PADDLE_THEME.LIGHT,
    },
  });

  return (
    <div className="gap-medium-2 flex flex-col">
      <PaddleExpressCheckoutButton
        checkoutState={checkoutState}
        isUpdatingPlan={isUpdatingPlan}
      />
      <MobileCheckoutPolicyFooter />
    </div>
  );
};
