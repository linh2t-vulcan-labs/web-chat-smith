import type { TPaymentCurrency } from "@/core/models/payment";
import { Exclude, Expose, Type } from "@/libs/class-transformer";
import type { EPAYMENT_VENDOR } from "@/utils/commons/enums";

@Exclude()
class CreateOrderItemPayload {
  @Expose({ name: "packageId" })
  subscription_id!: string;

  @Expose()
  quantity!: number;
}

@Exclude()
export class CreateOrderPayloadDto {
  @Expose()
  @Type(() => CreateOrderItemPayload)
  item!: CreateOrderItemPayload;
}

@Exclude()
export class CheckoutPayloadDto {
  @Expose({ name: "orderId" })
  order_id!: string;

  @Expose({ name: "paymentVendor" })
  payment_vendor!: EPAYMENT_VENDOR;

  @Expose({ name: "paymentMethod" })
  payment_method?: string;

  @Expose({ name: "successUrl" })
  success_url!: string;

  @Expose({ name: "cancelUrl" })
  cancel_url!: string;

  @Expose()
  description!: string;

  @Expose({ name: "dryRun" })
  dry_run?: boolean;

  @Expose()
  currency?: TPaymentCurrency;
}
