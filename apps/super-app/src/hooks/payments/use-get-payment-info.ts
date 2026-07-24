import { GetPaymentInfoPayloadDto } from "@/core/http/dto/payment";
import { paymentClientService } from "@/core/repositories";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useQuery } from "@/libs/react-query";
import type { EPAYMENT_VENDOR } from "@/utils/commons/enums";

export const useGetPaymentInfo = (vendor: EPAYMENT_VENDOR) =>
  useQuery({
    enabled: false,
    queryFn: async () => {
      const payload = new TransformerBuilder(GetPaymentInfoPayloadDto)
        .format({ vendor })
        .toPlainSnakeCase() as GetPaymentInfoPayloadDto;

      const [_error, result] =
        await paymentClientService.getPaymentInfo(payload);

      return result;
    },
    queryKey: ["useGetPaymentInfo", vendor],
  });
