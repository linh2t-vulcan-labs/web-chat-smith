import { WEB_FEATURE_CONFIG_KEYS } from "@/config/web-features";
import { useFeatureSetting } from "@/hooks/feature-setting/use-feature-setting";
import useSyncBeta from "@/hooks/remote-config/use-sync-beta";

export function useChatSyncFlag() {
  // This determines to show the chat sync feature on the UI.
  const { isBeta, isReady } = useSyncBeta();
  // This determines to enable the chat sync feature on the system.
  const { isEnabled } = useFeatureSetting(WEB_FEATURE_CONFIG_KEYS.SYNC_HISTORY);

  return {
    isBeta,
    isPersistenceEnabled: isEnabled,
    isReady,
  };
}
