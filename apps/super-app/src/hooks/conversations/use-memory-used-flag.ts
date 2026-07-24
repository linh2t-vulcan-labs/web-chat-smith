import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";

export function useMemoryUsedFlag() {
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const chatMemoryUsed = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.CHAT_MEMORY_USED
  );

  return {
    isEnable: chatMemoryUsed,
  };
}
