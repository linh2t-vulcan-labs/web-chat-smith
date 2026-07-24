import type { TGetPaymentMethodsResponse } from "@/core/http/dto/payment";
import { PaymentMethodItemModel } from "@/core/models/payment";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useQuery } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { useHttpClient } from "../../../../hooks/http-client";

const GET_PAYMENT_METHODS_QUERY_KEY = "useGetPaymentMethods";

export const useGetPaymentMethods = () => {
  const { httpClient } = useHttpClient();

  return useQuery({
    queryFn: async () => {
      const [error, response] =
        await httpClient.get<TGetPaymentMethodsResponse>(
          `/payments/api/v1/payments/payment_methods`
        );
      if (error) {
        throw new THttpError(error);
      }

      const flattenData = response.data.map((item) => item.info);

      const data = new TransformerBuilder(PaymentMethodItemModel)
        .format(flattenData)
        .toPlainCamelCase() as PaymentMethodItemModel[];
      return data;
    },
    queryKey: [GET_PAYMENT_METHODS_QUERY_KEY],
  });
};
