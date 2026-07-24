import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { DEFAULT_FLOATING_UPGRADE_CONFIG } from "@/libs/firebase/remote-config-default";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import type { FloatingUpgradeConfig } from "@/store/conversation/types";
import { safeJsonParse } from "@/utils/commons/helpers";

type useGetFloatingUpgradeConfigReturnType = FloatingUpgradeConfig;

export const useGetFloatingUpgradeConfig =
  (): useGetFloatingUpgradeConfigReturnType => {
    const { getValueSyncRemoteConfig } = useRemoteConfigContext();
    const raw = getValueSyncRemoteConfig(
      REMOTE_CONFIG_KEY.FLOATING_UPGRADE_CONFIG
    );
    const floatingUpgradeConfig =
      safeJsonParse<FloatingUpgradeConfig>(raw) ||
      DEFAULT_FLOATING_UPGRADE_CONFIG;

    return floatingUpgradeConfig;
  };
