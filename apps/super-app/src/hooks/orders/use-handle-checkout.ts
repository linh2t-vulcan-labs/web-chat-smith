import { CheckoutPayloadDto } from "@/core/http/dto/order";
import { orderClientService } from "@/core/repositories";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useMutation } from "@/libs/react-query";
import type { EPAYMENT_METHOD, EPAYMENT_VENDOR } from "@/utils/commons/enums";
import { THttpError } from "@/utils/commons/error";

export interface THandleCheckoutPayload {
  orderId: string;
  paymentVendor: EPAYMENT_VENDOR;
  paymentMethod: EPAYMENT_METHOD;
  successUrl: string;
  cancelUrl: string;
}

export const useHandleCheckoutMutation = () =>
  useMutation({
    mutationFn: async (payload: THandleCheckoutPayload) => {
      const plainCheckoutPayload = new TransformerBuilder(CheckoutPayloadDto)
        .format(payload, {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        })
        .toPlainSnakeCase() as CheckoutPayloadDto;

      const [error, result] =
        await orderClientService.checkout(plainCheckoutPayload);
      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    mutationKey: ["useHandleCheckoutMutation"],
  });
