import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";
import { openNewTab } from "@/utils/commons/helpers";

import { useHttpClient } from "../../../../hooks/http-client";

export function useGetPaymentInvoice(invoiceId: string) {
  const { httpClient } = useHttpClient();

  return useMutation({
    mutationFn: async () => {
      const [error, response] = await httpClient.get<{ url: string }>(
        `/payments/api/v1/payments/${invoiceId}/invoice`
      );

      if (error) {
        throw new THttpError(error);
      }

      openNewTab(response.url);

      return response.url;
    },
    mutationKey: ["useGetPaymentInvoice", invoiceId],
  });
}
