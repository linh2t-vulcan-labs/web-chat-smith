"use client";

import { toast } from "sonner";

import { BillingHistoryPayloadDto } from "@/core/http/dto/payment";
import { paymentClientService } from "@/core/repositories";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useMutation } from "@/libs/react-query";
import type { EPAYMENT_VENDOR } from "@/utils/commons/enums";
import { THttpError } from "@/utils/commons/error";

interface BillingHistoryPayload {
  customerId: string;
  vendor: EPAYMENT_VENDOR;
  returnUrl: string;
}

export const useBillingHistoryMutation = () =>
  useMutation({
    mutationFn: async (payload: BillingHistoryPayload) => {
      const mappingPayload = {
        ...payload,
        additional: {
          stripe: {
            return_url: payload.returnUrl,
          },
        },
      };

      const plainPayload = new TransformerBuilder(BillingHistoryPayloadDto)
        .format(mappingPayload, {
          excludeExtraneousValues: true,
          exposeUnsetFields: false,
        })
        .toPlainSnakeCase() as BillingHistoryPayloadDto;

      const [error, result] =
        await paymentClientService.billingHistory(plainPayload);

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    mutationKey: ["useBillingHistory"],
    onError: () => {
      toast.error(null, {
        description:
          "We encountered an unexpected error. Please try again later",
      });
      return null;
    },
    onSuccess: (createOrderResult) => {
      if (createOrderResult?.stripePortalUrl) {
        globalThis.window.location.href = createOrderResult?.stripePortalUrl;
      }
    },
  });
