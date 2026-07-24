import type { TGetTransactionsOfSubscriptionResponse } from "@/core/http/dto/payment";
import { PaymentTransactionItemModel } from "@/core/models/payment";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useQuery } from "@/libs/react-query";

import { useHttpClient } from "../../../../hooks/http-client";

interface TGetTransactionsOfSubscriptionPayload {
  subscriptionId: string;
  limit: number;
  page: number;
  transactionId?: string;
}

export const GET_TRANSACTIONS_OF_SUBSCRIPTION_QUERY_KEY =
  "useGetTransactionsOfSubscription";

export function useGetTransactionsOfSubscription(
  queryParams: TGetTransactionsOfSubscriptionPayload
) {
  const { httpClient } = useHttpClient();

  return useQuery({
    gcTime: 60 * 1000 * 20,
    queryFn: async () => {
      const [error, result] =
        await httpClient.get<TGetTransactionsOfSubscriptionResponse>(
          `/payments/api/v2/payments`,
          {
            params: {
              limit: queryParams.limit,
              page: queryParams.page,
              sub_id: queryParams.subscriptionId,
            },
          }
        );

      if (error) {
        return {
          data: [] as PaymentTransactionItemModel[],
          totalRecords: 0,
        };
      }

      const data = new TransformerBuilder(PaymentTransactionItemModel)
        .format(result?.data ?? [])
        .toPlainCamelCase() as PaymentTransactionItemModel[];

      return {
        data,
        totalRecords: result?.total_records,
      };
    },
    queryKey: [GET_TRANSACTIONS_OF_SUBSCRIPTION_QUERY_KEY, queryParams],
    staleTime: 60 * 1000 * 10,
  });
}
