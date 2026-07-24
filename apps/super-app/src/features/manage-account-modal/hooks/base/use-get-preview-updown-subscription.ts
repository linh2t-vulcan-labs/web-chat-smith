import { toast } from "sonner";

import type { TGetPreviewUpgradeDowngradeSubscriptionResponse } from "@/core/http/dto/payment";
import { PreviewUpgradeDowngradeSubscriptionModel } from "@/core/models/payment";
import { useHttpClient } from "@/hooks/http-client";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useQuery } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

export interface TGetPreviewUpgradeDowngradeSubscriptionPayload {
  subscriptionId: string; // selected subscription
  quantity: number;
  productId?: string;
  countryGroupId?: string;
}

interface TPreviewUpgradeDowngradeSubscriptionRequestParams {
  payload: TGetPreviewUpgradeDowngradeSubscriptionPayload;
  httpClient: ReturnType<typeof useHttpClient>["httpClient"];
}

export const previewUpgradeDowngradeSubscriptionQueryKey = (
  payload: TGetPreviewUpgradeDowngradeSubscriptionPayload
) => ["useGetPreviewUpgradeDowngradeSubscription", payload] as const;

export const previewUpgradeDowngradeSubscriptionRequest = async ({
  payload,
  httpClient,
}: TPreviewUpgradeDowngradeSubscriptionRequestParams) => {
  const { subscriptionId, productId, quantity, countryGroupId } = payload;

  const [error, response] =
    await httpClient.post<TGetPreviewUpgradeDowngradeSubscriptionResponse>(
      `/payments/api/v1/payments/subscriptions/${subscriptionId}/review`,
      {
        body: {
          item: {
            country_group_id: countryGroupId,
            product_id: productId,
            quantity,
          },
        },
      }
    );

  if (error) {
    toast.error(null, {
      description:
        "Something went wrong while processing your request. Please try again later!",
    });
    throw new THttpError(error);
  }

  const data = new TransformerBuilder(PreviewUpgradeDowngradeSubscriptionModel)
    .format(response)
    .toPlainCamelCase() as PreviewUpgradeDowngradeSubscriptionModel;

  return data;
};

export const useGetPreviewUpgradeDowngradeSubscription = (
  payload: TGetPreviewUpgradeDowngradeSubscriptionPayload,
  enabled?: boolean
) => {
  const { httpClient } = useHttpClient();
  const { subscriptionId, productId, quantity } = payload;

  const hasRequiredParams =
    Boolean(subscriptionId && productId) && typeof quantity === "number";

  return useQuery({
    enabled: hasRequiredParams && !!enabled,
    queryFn: () =>
      previewUpgradeDowngradeSubscriptionRequest({ httpClient, payload }),
    queryKey: previewUpgradeDowngradeSubscriptionQueryKey(payload),
  });
};
