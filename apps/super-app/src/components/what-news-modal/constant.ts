import { CURRENT_NEW_FEATURES_VERSION } from "@/utils/commons/keys";

import type { TRemoteConfigWhatNewsPopupOptions } from "./types";

const DEFAULT_REMOTE_CONFIG_WHAT_NEWS_POPUP_OPTIONS: TRemoteConfigWhatNewsPopupOptions =
  {
    config: {
      enabled: false,
      version: CURRENT_NEW_FEATURES_VERSION,
    },
    features: [],
  };

export { DEFAULT_REMOTE_CONFIG_WHAT_NEWS_POPUP_OPTIONS };
