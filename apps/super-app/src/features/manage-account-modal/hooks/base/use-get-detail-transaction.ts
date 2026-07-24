import type { TGetDetailTransactionResponse } from "@/core/http/dto/payment";
import {
  DetailTransactionItemModel,
  ECheckoutSessionMode,
} from "@/core/models/payment";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useQuery } from "@/libs/react-query";

import { useHttpClient } from "../../../../hooks/http-client";

export const GET_DETAIL_TRANSACTION_QUERY_KEY = "useGetDetailTransaction";

interface TUseGetPaymentMethodByLatestTransactionPayload {
  transactionId?: string;
  transactionMode?: ECheckoutSessionMode;
}

export const useGetDetailTransaction = (
  payload?: TUseGetPaymentMethodByLatestTransactionPayload
) => {
  const { httpClient } = useHttpClient();

  return useQuery({
    enabled: Boolean(payload?.transactionId),
    queryFn: async () => {
      const isRefund =
        payload?.transactionMode ===
        ECheckoutSessionMode.CHECKOUT_SESSION_MODE_REFUND;
      const pathName = isRefund
        ? `/payments/api/v1/payments/${payload?.transactionId}/refund`
        : `/payments/api/v1/payments/${payload?.transactionId}`;

      const [_error, result] =
        await httpClient.get<TGetDetailTransactionResponse>(pathName);

      const data = new TransformerBuilder(DetailTransactionItemModel)
        .format(result?.data)
        .toPlainCamelCase() as DetailTransactionItemModel;

      return data;
    },
    queryKey: [GET_DETAIL_TRANSACTION_QUERY_KEY, payload],
  });
};
