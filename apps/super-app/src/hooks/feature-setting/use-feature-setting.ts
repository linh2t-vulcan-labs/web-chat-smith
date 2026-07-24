import { useWebFeature } from "@cs/flags/react";

import type {
  TWebFeatureItem,
  WEB_FEATURE_CONFIG_KEYS,
} from "@/config/web-features";
import { defaultWebFeatures } from "@/config/web-features";

type TKey =
  (typeof WEB_FEATURE_CONFIG_KEYS)[keyof typeof WEB_FEATURE_CONFIG_KEYS];

export const useFeatureSetting = (key: TKey): TWebFeatureItem => {
  const feature = useWebFeature<TWebFeatureItem>(key);
  return feature ?? defaultWebFeatures[key];
};
