import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { useHttpClient } from "../../../../hooks/http-client";

interface TUpgradeDowngradeSubscriptionInput {
  subscriptionId: string;
  // Product Id from API Get Products By App Id
  quantity: number;
  productId: string;
  countryGroupId?: string;
}

export const useUpgradeDowngradeSubscription = () => {
  const { httpClient } = useHttpClient();

  return useMutation({
    mutationFn: async (payload: TUpgradeDowngradeSubscriptionInput) => {
      const { subscriptionId, productId, countryGroupId, quantity } = payload;
      const body = {
        item: {
          country_group_id: countryGroupId,
          product_id: productId,
          quantity,
        },
      };

      const [error, response] = await httpClient.put(
        `/payments/api/v1/payments/subscriptions/${subscriptionId}`,
        { body }
      );

      if (error) {
        throw new THttpError(error);
      }
      return response;
    },
    mutationKey: ["useUpgradeDowngradeSubscription"],
  });
};
