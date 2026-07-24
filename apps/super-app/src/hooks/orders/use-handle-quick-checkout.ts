import { CheckoutPayloadDto } from "@/core/http/dto/order";
import { orderClientService } from "@/core/repositories";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useMutation } from "@/libs/react-query";
import type { EPAYMENT_METHOD, EPAYMENT_VENDOR } from "@/utils/commons/enums";
import { THttpError } from "@/utils/commons/error";

export interface THandleQuickCheckoutPayload {
  orderId: string;
  paymentVendor: EPAYMENT_VENDOR;
  paymentMethod: EPAYMENT_METHOD;
  successUrl: string;
  cancelUrl: string;
  dryRun?: boolean;
}

export const useHandleQuickCheckoutMutation = () =>
  useMutation({
    mutationFn: async (payload: THandleQuickCheckoutPayload) => {
      const plainCheckoutPayload = new TransformerBuilder(CheckoutPayloadDto)
        .format(payload, {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        })
        .toPlainSnakeCase() as CheckoutPayloadDto;
      const [error, result] =
        await orderClientService.quickCheckout(plainCheckoutPayload);

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    mutationKey: ["useHandleQuickCheckoutMutation"],
  });
