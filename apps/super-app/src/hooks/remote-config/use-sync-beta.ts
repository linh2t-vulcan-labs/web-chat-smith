import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";

interface TUseSyncBetaReturn {
  isBeta: boolean;
  isReady: boolean;
}

function useSyncBeta(): TUseSyncBetaReturn {
  // Remote Config
  const { getValueSyncRemoteConfig, isReady } = useRemoteConfigContext();
  const isBeta = getValueSyncRemoteConfig(REMOTE_CONFIG_KEY.SYNC_BETA);

  return {
    isBeta,
    isReady,
  };
}

export default useSyncBeta;
