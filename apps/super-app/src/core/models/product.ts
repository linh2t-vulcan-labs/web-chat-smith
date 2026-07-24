import { premiumBenefits, upcomingFeatures } from "@/config/product-options";
import { Exclude, Expose, Transform, Type } from "@/libs/class-transformer";
import type { EPRODUCT_STATUS, ESTATUS_WORKING } from "@/utils/commons/enums";
import { EDURATION_UNIT } from "@/utils/commons/enums";
import {
  mappingCurrencyISOFormat,
  mappingCurrencySymbol,
  mappingStatusWorking,
} from "@/utils/mappers/common";
import {
  mappingPackageSubscriptionDurationUnit,
  mappingPricePerDay,
  mappingPricePerWeek,
} from "@/utils/mappers/product";

export type TDurationUnitLabel = "day" | "week" | "month" | "year" | "quarter";

@Exclude()
class SubscriptionAppInfoModel {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  @Transform(({ value }) => mappingStatusWorking(value))
  status!: ESTATUS_WORKING;

  @Expose({ name: "created_at" })
  createdAt!: string;

  @Expose({ name: "updated_at" })
  updatedAt!: string;

  @Expose({ name: "cross_apps" })
  @Type(() => SubscriptionAppInfoModel)
  crossApps!: SubscriptionAppInfoModel[];
}

@Exclude()
class SubscriptionPriceInfoModel {
  @Expose()
  id!: string;

  @Expose({ name: "subscription_id" })
  subscriptionId!: string;

  @Expose()
  @Transform(({ value }) => mappingStatusWorking(value))
  status!: ESTATUS_WORKING;

  @Expose()
  price!: number;

  @Expose()
  currency!: string;

  @Expose()
  get currencyIsoFormat() {
    return mappingCurrencyISOFormat(this.currency);
  }

  @Expose({ name: "created_at" })
  createdAt!: string;

  @Expose({ name: "updated_at" })
  updatedAt!: string;
}

@Exclude()
export class ProductModel {
  @Expose()
  id!: string;

  @Expose({ name: "app_id" })
  appId!: string;

  @Expose()
  description!: string;

  @Expose()
  status!: EPRODUCT_STATUS;

  @Expose({ name: "duration_unit" })
  durationUnit!: EDURATION_UNIT;

  @Expose({ name: "duration_value" })
  durationValue!: number;

  @Expose({ name: "created_at" })
  createdAt!: string;

  @Expose({ name: "updated_at" })
  updatedAt!: string;

  @Expose()
  @Type(() => SubscriptionAppInfoModel)
  app!: SubscriptionAppInfoModel;

  @Expose({ name: "default_price" })
  @Type(() => SubscriptionPriceInfoModel)
  defaultPrice: SubscriptionPriceInfoModel = {} as SubscriptionPriceInfoModel;

  @Expose({ name: "subscription_prices" })
  @Type(() => SubscriptionPriceInfoModel)
  subscriptionPrices: SubscriptionPriceInfoModel[] = [];

  @Expose({ name: "vendor_subscriptions" })
  @Type(() => SubscriptionPriceInfoModel)
  vendorSubscriptions: SubscriptionPriceInfoModel[] = [];

  // Populated client-side after fetching the payment-service product mapping.
  // Holds the Paddle priceId (pri_xxx) used for items-based checkout.
  vendorProductId?: string;

  @Expose()
  get numberOfMonths() {
    const objNumberOfMonth: Partial<Record<EDURATION_UNIT, number>> = {
      [EDURATION_UNIT.MONTH]: 1,
      [EDURATION_UNIT.QUARTERLY]: 3,
      [EDURATION_UNIT.YEAR]: 12,
    };
    return objNumberOfMonth[this.durationUnit] ?? 0;
  }

  @Expose()
  get title(): string {
    const label = this.numberOfMonths < 2 ? "Month" : "Months";

    return `${this.numberOfMonths} ${label}`;
  }

  @Expose()
  get currencySymbol() {
    return mappingCurrencySymbol(this.defaultPrice?.currency);
  }

  @Expose()
  get price() {
    return this.defaultPrice?.price;
  }

  @Expose()
  get sellingPrice() {
    return `${this.currencySymbol}${this.defaultPrice?.price}`;
  }

  @Expose()
  get benefits() {
    const benefit: Partial<Record<EDURATION_UNIT, typeof premiumBenefits>> = {
      [EDURATION_UNIT.MONTH]: premiumBenefits,
      [EDURATION_UNIT.QUARTERLY]: premiumBenefits,
      [EDURATION_UNIT.YEAR]: premiumBenefits,
    };

    return benefit[this.durationUnit] ?? [];
  }

  @Expose()
  get upcomingFeatures() {
    const benefit: Partial<Record<EDURATION_UNIT, typeof upcomingFeatures>> = {
      [EDURATION_UNIT.MONTH]: upcomingFeatures,
      [EDURATION_UNIT.QUARTERLY]: upcomingFeatures,
      [EDURATION_UNIT.YEAR]: upcomingFeatures,
    };

    return benefit[this.durationUnit] ?? [];
  }

  @Expose()
  get originalPrice() {
    const objOriginalPrice: Partial<Record<EDURATION_UNIT, number>> = {
      [EDURATION_UNIT.DAY]: 3.99,
      [EDURATION_UNIT.MONTH]: 29.99,
      [EDURATION_UNIT.QUARTERLY]: 69.99,
      [EDURATION_UNIT.YEAR]: 199.99,
    };

    return `${this.currencySymbol}${objOriginalPrice[this.durationUnit]}`;
  }

  get bestOriginalPrice() {
    const objOriginalPrice = {
      [EDURATION_UNIT.DAY]: 3.99,
      [EDURATION_UNIT.MONTH]: 29.99,
      [EDURATION_UNIT.QUARTERLY]: 69.99,
      [EDURATION_UNIT.YEAR]: 199.99,
    };

    const pricingList = Object.entries(objOriginalPrice)
      .map(([unit, price]) =>
        mappingPricePerWeek(unit as EDURATION_UNIT, price)
      )
      .toSorted((a, b) => {
        const aPrice = Number(a);
        const bPrice = Number(b);

        return aPrice - bPrice;
      });
    const [bestPrice] = pricingList;
    return `${mappingCurrencySymbol(this.defaultPrice?.currency)}${bestPrice}`;
  }

  @Expose()
  get durationUnitLabel() {
    return mappingPackageSubscriptionDurationUnit(this.durationUnit);
  }

  @Expose()
  get advDurationUnitLabel() {
    if (this.durationUnitLabel === "day") {
      return "daily";
    }
    return `${this.durationUnitLabel}ly`;
  }

  @Expose()
  get priceWithCurrencySymbol() {
    return `${mappingCurrencySymbol(this.defaultPrice?.currency)}${this.defaultPrice?.price}`;
  }

  @Expose()
  get pricePerWeekNumeric() {
    const calculatedPrice = this.defaultPrice?.price
      ? mappingPricePerWeek(this.durationUnit, this.defaultPrice?.price)
      : 0;
    return calculatedPrice;
  }

  @Expose()
  get pricePerWeek() {
    const calculatedPrice = this.pricePerWeekNumeric;
    return `${mappingCurrencySymbol(this.defaultPrice?.currency)}${calculatedPrice}`;
  }

  @Expose()
  get pricePerDay() {
    const calculatedPrice = this.defaultPrice?.price
      ? mappingPricePerDay(this.durationUnit, this.defaultPrice?.price)
      : 0;
    return `${mappingCurrencySymbol(this.defaultPrice?.currency)}${calculatedPrice}`;
  }

  @Expose()
  get isTrial() {
    return this.id.includes("trial");
  }
}
