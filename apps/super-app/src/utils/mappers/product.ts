import type { TDurationUnitLabel } from "@/core/models/product";
import dayjs from "@/libs/dayjs";

import { EDURATION_UNIT } from "../commons/enums";
import {
  DAYS_IN_MONTH,
  DAYS_IN_QUARTER,
  DAYS_IN_WEEK,
  DAYS_IN_YEAR,
  NUMBERS_OF_WEEK,
  NUMBERS_OF_WEEK_IN_QUARTER,
} from "../constants/common";

export const mappingPackageSubscriptionDurationUnit = (
  durationUnit: EDURATION_UNIT
): TDurationUnitLabel => {
  const mappingObject: Record<EDURATION_UNIT, TDurationUnitLabel> = {
    [EDURATION_UNIT.DAY]: "day",
    [EDURATION_UNIT.WEEK]: "week",
    [EDURATION_UNIT.MONTH]: "month",
    [EDURATION_UNIT.YEAR]: "year",
    [EDURATION_UNIT.QUARTERLY]: "quarter",
  };

  return mappingObject[durationUnit] ?? "month";
};

export const mappingPricePerWeek = (
  durationUnit: EDURATION_UNIT,
  price: number
): string => {
  const weeksInYear = dayjs().isoWeeksInYear();

  const mappingObject: Partial<Record<EDURATION_UNIT, number>> = {
    [EDURATION_UNIT.WEEK]: price,
    [EDURATION_UNIT.MONTH]: price / NUMBERS_OF_WEEK,
    [EDURATION_UNIT.YEAR]: price / weeksInYear,
    [EDURATION_UNIT.QUARTERLY]: price / NUMBERS_OF_WEEK_IN_QUARTER,
  };

  const calculatedPrice = mappingObject[durationUnit] ?? price;
  const roundedNumber = Number(calculatedPrice.toFixed(2));

  return roundedNumber.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

export const mappingPricePerDay = (
  durationUnit: EDURATION_UNIT,
  price: number
): string => {
  const mappingObject: Partial<Record<EDURATION_UNIT, number>> = {
    [EDURATION_UNIT.WEEK]: price / DAYS_IN_WEEK,
    [EDURATION_UNIT.MONTH]: price / DAYS_IN_MONTH,
    [EDURATION_UNIT.YEAR]: price / DAYS_IN_YEAR,
    [EDURATION_UNIT.QUARTERLY]: price / DAYS_IN_QUARTER,
  };

  const calculatedPrice = mappingObject[durationUnit] ?? price;
  const roundedNumber = Number(calculatedPrice.toFixed(2));

  return roundedNumber.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};
