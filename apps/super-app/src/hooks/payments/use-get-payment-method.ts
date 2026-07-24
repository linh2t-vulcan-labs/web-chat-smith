import type {
  TPaymentCardType,
  TPaymentType,
  TPaymentVendorOfSubscriptionUser,
} from "@/core/models/payment";
import { PaymentMethodInfoModel } from "@/core/models/payment";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useQuery } from "@/libs/react-query";

import { useHttpClient } from "../http-client";

interface TGetPaymentMethodResponse {
  vendor: TPaymentVendorOfSubscriptionUser;
  type: TPaymentType;
  card_type?: TPaymentCardType;
  card_last4?: string;
  cardholder_name?: string;
  card_expiry_month?: number;
  card_expiry_year?: number;
}

export const GET_PAYMENT_METHOD_INFO_QUERY_KEY = "useGetPaymentMethod";

export const useGetPaymentMethod = () => {
  const { httpClient } = useHttpClient();

  return useQuery({
    queryFn: async () => {
      const [, result] = await httpClient.get<{
        data: TGetPaymentMethodResponse;
      }>("/payments/api/v1/payments/payment_method_info");

      const data = new TransformerBuilder(PaymentMethodInfoModel)
        .format(result?.data)
        .toPlainCamelCase() as PaymentMethodInfoModel;

      return data;
    },
    queryKey: [GET_PAYMENT_METHOD_INFO_QUERY_KEY],
  });
};
