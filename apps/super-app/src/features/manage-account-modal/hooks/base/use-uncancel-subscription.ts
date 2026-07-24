import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { useHttpClient } from "../../../../hooks/http-client";

export function useUncancelSubscription() {
  const { httpClient } = useHttpClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      const [error, response] = await httpClient.post(
        `/payments/api/v1/payments/subscriptions/${subscriptionId}/un-cancel`
      );
      if (error) {
        throw new THttpError(error);
      }
      return response;
    },
    mutationKey: ["useUncancelSubscription"],
  });
}
