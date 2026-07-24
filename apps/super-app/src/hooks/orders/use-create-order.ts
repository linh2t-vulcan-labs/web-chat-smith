"use client";

import { CreateOrderPayloadDto } from "@/core/http/dto/order";
import { orderClientService } from "@/core/repositories";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

interface TCreateOrderPayload {
  packageId: string;
  quantity: number;
}

export const useCreateOrderMutation = () =>
  useMutation({
    mutationFn: async (payload: TCreateOrderPayload) => {
      const mappingPayload = {
        item: {
          packageId: payload.packageId,
          quantity: payload.quantity,
        },
      };

      const plainCreateOrderPayload = new TransformerBuilder(
        CreateOrderPayloadDto
      )
        .format(mappingPayload, {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        })
        .toPlainSnakeCase() as CreateOrderPayloadDto;
      const [error, result] = await orderClientService.createOrder(
        plainCreateOrderPayload
      );

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    mutationKey: ["useCreateOrder"],
    onError: (error) => error,
  });
