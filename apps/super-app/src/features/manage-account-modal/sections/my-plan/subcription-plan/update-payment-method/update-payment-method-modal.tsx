import { getPublicEnv } from "@cs/env/client";
import { IconsOutlinedClosedIcon } from "@cs/icons/icons-outlined-closed";
import { useLocale } from "next-intl";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import LoadingProcessing from "@/components/loading-icon/loading-processing";
import { ModalV2 } from "@/components/modal";
import { MODAL_Z_INDEX } from "@/config/z-index";
import { GET_TRANSACTIONS_OF_SUBSCRIPTION_QUERY_KEY } from "@/features/manage-account-modal/hooks";
import { GET_PAYMENT_METHOD_INFO_QUERY_KEY } from "@/hooks/payments/use-get-payment-method";
import { usePaddleCheckout } from "@/hooks/subscriptions";
import { withInlineSettings } from "@/libs/paddle-js";
import { PADDLE_CONTAINER_CLASSNAME } from "@/libs/paddle-js/constants";
import { useQueryClient } from "@/libs/react-query";
import { useGlobalState } from "@/store/global/hooks";
import { delay } from "@/utils/commons/helpers";
import { compositeStyles } from "@/utils/commons/styles";

import type { TUpdatePaymentMethodModalProps } from "./types";

export default function UpdatePaymentMethodModal(
  props: TUpdatePaymentMethodModalProps
) {
  const { open, onClose, transactionId, subscriptionId } = props;
  const queryClient = useQueryClient();
  const user = useGlobalState((state) => state.user);
  const userEmail = user?.email;
  const locale = useLocale();
  const [isProcessingCheckoutResult, setIsProcessingCheckoutResult] =
    useState(false);
  const {
    ready: paddleReady,
    openCheckout,
    setFlowHandlers,
    clearFlowHandlers,
  } = usePaddleCheckout();

  useEffect(() => {
    setFlowHandlers("updatePaymentMethod", {
      onClosed: () => {
        // Intentional no-op: nothing to do when the checkout is closed.
      },
      onError: () => {
        // Intentional no-op: no error UI needed here, onPaymentFailed covers it.
      },
      onLoaded: () => {
        // Intentional no-op: nothing to do when the checkout finishes loading.
      },
      onPaymentFailed: () => {
        toast.error(
          "Payment was declined. Please check your payment details and try again."
        );
      },
      onSuccess: () => {
        const invalidateQueriesAndClose = async () => {
          setIsProcessingCheckoutResult(true);

          try {
            await delay(
              getPublicEnv().CS_PUBLIC_DELAY_TIME_MANAGE_SUBSCRIPTION
            );
            await Promise.all([
              queryClient.invalidateQueries({
                queryKey: [
                  GET_TRANSACTIONS_OF_SUBSCRIPTION_QUERY_KEY,
                  { subscriptionId },
                ],
              }),
              queryClient.invalidateQueries({
                queryKey: [GET_PAYMENT_METHOD_INFO_QUERY_KEY],
              }),
            ]);
            onClose();
          } catch {
            toast.error(
              "Something went wrong while finishing the payment. Please try again."
            );
          } finally {
            setIsProcessingCheckoutResult(false);
          }
        };

        invalidateQueriesAndClose();
      },
    });

    return () => {
      clearFlowHandlers("updatePaymentMethod");
    };
  }, [
    clearFlowHandlers,
    onClose,
    queryClient,
    setFlowHandlers,
    subscriptionId,
  ]);

  useEffect(() => {
    if (!open || !transactionId || !paddleReady) {
      return;
    }

    setTimeout(() => {
      openCheckout(
        "updatePaymentMethod",
        withInlineSettings(
          { customer: { email: userEmail }, transactionId },
          PADDLE_CONTAINER_CLASSNAME.PADDLE_UPDATE_PAYMENT_METHOD_CONTAINER,
          {
            locale,
            theme: "light",
          }
        )
      );
    }, 300);
  }, [locale, open, openCheckout, paddleReady, transactionId, userEmail]);

  return (
    <ModalV2
      open={open}
      zIndex={MODAL_Z_INDEX.MANAGE_ACCOUNT}
      onClose={onClose}
      isPreventClickOutside={isProcessingCheckoutResult}
      containerClassName="bg-white"
      className={compositeStyles(
        "!p-medium-2 md:!p-medium-2.5 relative max-h-[calc(100dvh-80px)] w-full overflow-hidden overflow-y-auto md:w-[500px]"
      )}
    >
      <div
        className={compositeStyles(
          "relative w-full md:h-[657px]",
          PADDLE_CONTAINER_CLASSNAME.PADDLE_UPDATE_PAYMENT_METHOD_CONTAINER
        )}
      >
        <IconsOutlinedClosedIcon
          className={compositeStyles(
            "text-icon-general-tertiary absolute top-0 right-0 cursor-pointer hover:brightness-75",
            isProcessingCheckoutResult && "pointer-events-none opacity-50"
          )}
          width={20}
          height={20}
          onClick={isProcessingCheckoutResult ? undefined : onClose}
          aria-disabled={isProcessingCheckoutResult}
        />
      </div>

      {isProcessingCheckoutResult && (
        <LoadingProcessing isSpinning={isProcessingCheckoutResult} />
      )}
    </ModalV2>
  );
}
