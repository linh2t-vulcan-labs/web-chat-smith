import { useHttpClient } from "@/hooks/http-client";
import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

export interface TGetTransactionUpdatePaymentMethodPayload {
  subscriptionId: string;
}

export const useGetTransactionUpdatePaymentMethod = () => {
  const { httpClient } = useHttpClient();

  return useMutation({
    mutationFn: async (payload: TGetTransactionUpdatePaymentMethodPayload) => {
      const { subscriptionId } = payload;

      const [error, result] = await httpClient.post<{ trans_id: string }>(
        "/payments/api/v1/payments/payment_methods",
        {
          body: {
            sub_id: subscriptionId,
          },
        }
      );

      if (error) {
        throw new THttpError(error);
      }

      return result?.trans_id;
    },
    mutationKey: ["getTransactionUpdatePaymentMethod"],
  });
};
