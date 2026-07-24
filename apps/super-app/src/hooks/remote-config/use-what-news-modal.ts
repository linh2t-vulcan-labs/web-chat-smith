import { DEFAULT_REMOTE_CONFIG_WHAT_NEWS_POPUP_OPTIONS } from "@/components/what-news-modal/constant";
import type { TRemoteConfigWhatNewsPopupOptions } from "@/components/what-news-modal/types";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { safeJsonParse } from "@/utils/commons/helpers";
import {
  CURRENT_NEW_FEATURES_VERSION,
  HAS_SEEN_NEW_FEATURES_MODAL_KEY,
} from "@/utils/commons/keys";

export const useWhatNewsModalRemoteConfig = () => {
  const { getValueSyncRemoteConfig, isReady } = useRemoteConfigContext();
  const rawFeatureData = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.WHAT_NEWS_POPUP_OPTIONS
  );
  const whatNewsData: TRemoteConfigWhatNewsPopupOptions =
    safeJsonParse<TRemoteConfigWhatNewsPopupOptions>(rawFeatureData) ||
    DEFAULT_REMOTE_CONFIG_WHAT_NEWS_POPUP_OPTIONS;

  const featuresData = whatNewsData.features || [];
  const whatNewsConfig = whatNewsData.config;
  const whatNewsVersion =
    whatNewsConfig?.version || CURRENT_NEW_FEATURES_VERSION;
  const whatNewsLocalStorageKey = `${HAS_SEEN_NEW_FEATURES_MODAL_KEY}-${whatNewsConfig.version}`;

  return {
    featuresData,
    isEnabledWhatNews: whatNewsConfig?.enabled && featuresData.length > 0,
    isReady,
    whatNewsConfig,
    whatNewsId: HAS_SEEN_NEW_FEATURES_MODAL_KEY,
    whatNewsLocalStorageKey,
    whatNewsVersion,
  };
};
