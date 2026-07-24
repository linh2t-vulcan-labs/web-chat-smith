import type { TGetPaymentSubscriptionResponse } from "@/core/http/dto/payment";
import { PaymentSubscriptionModel } from "@/core/models/payment";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useQuery } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { useHttpClient } from "../../../../hooks/http-client";

export const USE_GET_PAYMENT_SUBSCRIPTIONS_QUERY_KEY =
  "useGetPaymentSubscriptions";

export const useGetPaymentSubscriptions = (enabled?: boolean) => {
  const { httpClient } = useHttpClient();
  return useQuery({
    enabled,
    gcTime: 60 * 1000 * 20,
    queryFn: async () => {
      const [error, response] = await httpClient.get<{
        data: TGetPaymentSubscriptionResponse[];
      }>("/payments/api/v1/subscription");
      if (error) {
        throw new THttpError(error);
      }

      const data = new TransformerBuilder(PaymentSubscriptionModel)
        .format(response?.data ?? [])
        .toPlainCamelCase() as PaymentSubscriptionModel[];
      return data;
    },
    queryKey: [USE_GET_PAYMENT_SUBSCRIPTIONS_QUERY_KEY, enabled],
    staleTime: 60 * 1000 * 10,
  });
};
