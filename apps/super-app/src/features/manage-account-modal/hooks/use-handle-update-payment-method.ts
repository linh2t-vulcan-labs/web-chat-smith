import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useGetTransactionUpdatePaymentMethod } from "./base/use-get-transaction-update-payment-method";

const defaultUpdatePaymentMethodModalState = {
  open: false,
  subscriptionId: null,
  transactionId: null,
} as const;

export type TUpdatePaymentMethodModalState = Readonly<{
  open: boolean;
  transactionId: string | null;
  subscriptionId: string | null;
}>;

export const useHandleUpdatePaymentMethod = () => {
  const [modalState, setModalState] = useState<TUpdatePaymentMethodModalState>(
    defaultUpdatePaymentMethodModalState
  );

  const getTransactionUpdatePaymentMethodMutation =
    useGetTransactionUpdatePaymentMethod();

  const handleCloseModal = useCallback(() => {
    setModalState(defaultUpdatePaymentMethodModalState);
  }, []);

  const handleUpdatePaymentMethod = useCallback(
    async (subscriptionId: string) => {
      if (!subscriptionId) {
        return;
      }

      try {
        const transactionId =
          await getTransactionUpdatePaymentMethodMutation.mutateAsync({
            subscriptionId,
          });

        setModalState({
          open: true,
          subscriptionId,
          transactionId,
        });
      } catch {
        toast.error(null, {
          description:
            "Something went wrong while processing your request. Please try again later!",
        });
      }
    },
    [getTransactionUpdatePaymentMethodMutation]
  );

  return {
    getTransactionUpdatePaymentMethodMutation,
    handleCloseModal,
    handleUpdatePaymentMethod,
    isLoading: getTransactionUpdatePaymentMethodMutation.isPending,
    modalState,
  };
};
