import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { DEFAULT_FREE_USER_USAGE_CONFIG } from "@/libs/firebase/remote-config-default";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { safeJsonParse } from "@/utils/commons/helpers";

export interface TRemoteConfigFreeUsageConfig {
  enabled: boolean;
}

function useFreeUsageConfig() {
  // Remote Config
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const freeUserUsageConfigRaw = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.FREE_USER_USAGE_CONFIG
  );
  const freeUserUsageConfig =
    safeJsonParse<TRemoteConfigFreeUsageConfig>(freeUserUsageConfigRaw) ??
    DEFAULT_FREE_USER_USAGE_CONFIG;

  return freeUserUsageConfig;
}

export default useFreeUsageConfig;
