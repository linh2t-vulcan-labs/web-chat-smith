import { Exclude, Expose, Transform, Type } from "@/libs/class-transformer";
import dayjs from "@/libs/dayjs";

@Exclude()
export class CreateOrderResponseModel {
  @Expose({ name: "order_id" })
  orderId!: string;
}

class CheckoutResponsePaddleModel {
  @Expose({ name: "transaction_id" })
  transactionId!: string;
}
class CheckoutResponseExtendModel {
  @Expose()
  @Type(() => CheckoutResponsePaddleModel)
  paddle?: CheckoutResponsePaddleModel;
}

@Exclude()
export class CheckoutResponseModel {
  @Expose()
  url!: string;

  @Expose()
  @Type(() => CheckoutResponseExtendModel)
  extend!: CheckoutResponseExtendModel;

  @Expose({ name: "sub_total" })
  subTotal!: number;

  @Expose({ name: "due_at" })
  @Transform(({ value }) => {
    if (!value) {
      return "";
    }

    return dayjs(value).format("MMM D, YYYY");
  })
  dueAt!: string;
}

@Exclude()
export class UserOrderTrialUsagesModel {
  @Expose({ name: "user_id" })
  userId!: string;

  @Expose({ name: "group_id" })
  groupId!: string;

  @Expose({ name: "created_at" })
  createdAt!: string;
}
