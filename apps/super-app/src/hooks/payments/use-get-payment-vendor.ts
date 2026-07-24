import { useQuery } from "@/libs/react-query";
import { useAuthState } from "@/store/auth";
import { EPAYMENT_VENDOR_NUMBER } from "@/utils/commons/enums";

import { useHttpClient } from "../http-client";

interface TGetPaymentVendorResponse {
  vendor: EPAYMENT_VENDOR_NUMBER;
  vendor_customer_id?: string;
}

const USE_GET_PAYMENT_VENDER_QUERY_KEY = "useGetPaymentVendor";

export function useGetPaymentVendor() {
  const isAuthenticated = useAuthState((state) => state.isAuthenticated);
  const { httpClient } = useHttpClient();

  const { data, isLoading } = useQuery({
    enabled: isAuthenticated,
    queryFn: async () => {
      const response = await httpClient.get<TGetPaymentVendorResponse>(
        "/payments/api/v1/payments/provider"
      );
      const [error, data] = response;

      if (error) {
        return {
          vendor: EPAYMENT_VENDOR_NUMBER.PAYMENT_PROVIDER_UNSPECIFIED,
          vendor_customer_id: undefined,
        };
      }

      return data;
    },
    queryKey: [USE_GET_PAYMENT_VENDER_QUERY_KEY],
  });

  return {
    isLoading,
    isPaddle: data?.vendor === EPAYMENT_VENDOR_NUMBER.PAYMENT_PROVIDER_PADDLE,
    isStripe: data?.vendor === EPAYMENT_VENDOR_NUMBER.PAYMENT_PROVIDER_STRIPE,
    isUnspecified:
      data?.vendor === EPAYMENT_VENDOR_NUMBER.PAYMENT_PROVIDER_UNSPECIFIED,
    paddleCustomerId: data?.vendor_customer_id || "",
  };
}
