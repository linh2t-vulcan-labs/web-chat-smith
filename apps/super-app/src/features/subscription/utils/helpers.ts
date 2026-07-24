import { EDURATION_UNIT } from "@/utils/commons/enums";

import {
  SUBSCRIPTION_TIER,
  TIER_BY_OFFSET,
  TRIAL_DS_VERSIONS,
} from "../constants/subscription";

export function getFormattedDate(locale = "en") {
  const today = new Date();

  const localeMap: Record<typeof locale, string> = {
    ar: "ar",
    en: "en-GB",
    es: "es-ES",
    jp: "ja-JP",
    kr: "ko-KR",
    th: "th-TH",
    zh: "zh-CN",
  };

  return today.toLocaleDateString(localeMap[locale], {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function getSubscriptionDueDate(locale = "en", daysToAdd = 3) {
  const today = new Date();

  // add 3 days
  today.setDate(today.getDate() + daysToAdd);

  const localeMap: Record<typeof locale, string> = {
    ar: "ar",
    en: "en-GB",
    es: "es-ES",
    jp: "ja-JP",
    kr: "ko-KR",
    th: "th-TH",
    zh: "zh-CN",
  };

  return today.toLocaleDateString(localeMap[locale], {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function getSubscriptionExpiryDate(
  value: number,
  durationUnit: EDURATION_UNIT,
  locale = "en"
) {
  const date = new Date();

  const localeMap: Record<typeof locale, string> = {
    ar: "ar",
    en: "en-GB",
    es: "es-ES",
    jp: "ja-JP",
    kr: "ko-KR",
    th: "th-TH",
    zh: "zh-CN",
  };

  switch (durationUnit) {
    case EDURATION_UNIT.DAY: {
      date.setDate(date.getDate() + value);
      break;
    }

    case EDURATION_UNIT.WEEK: {
      date.setDate(date.getDate() + value * 7);
      break;
    }

    case EDURATION_UNIT.MONTH: {
      date.setMonth(date.getMonth() + value);
      break;
    }

    case EDURATION_UNIT.QUARTERLY: {
      date.setMonth(date.getMonth() + value * 3);
      break;
    }

    case EDURATION_UNIT.YEAR: {
      date.setFullYear(date.getFullYear() + value);
      break;
    }

    default: {
      throw new Error("Invalid duration unit");
    }
  }

  return date.toLocaleDateString(localeMap[locale], {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function getDSTier(dsVer?: number) {
  if (dsVer === null || dsVer === undefined) {
    return SUBSCRIPTION_TIER.TIER1;
  }

  const index = (dsVer - 6) % 3;
  return TIER_BY_OFFSET[index] ?? SUBSCRIPTION_TIER.TIER1;
}

export function isTrialDSVersion(dsVer?: number) {
  return dsVer !== null && dsVer !== undefined && TRIAL_DS_VERSIONS.has(dsVer);
}
