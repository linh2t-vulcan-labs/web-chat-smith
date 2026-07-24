import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { useHttpClient } from "../../../../hooks/http-client";

export const useDeletePaymentMethod = () => {
  const { httpClient } = useHttpClient();

  return useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const [error, response] = await httpClient.delete(
        `/payments/api/v1/payments/payment_methods/${paymentMethodId}`
      );

      if (error) {
        throw new THttpError(error);
      }
      return response;
    },
  });
};
