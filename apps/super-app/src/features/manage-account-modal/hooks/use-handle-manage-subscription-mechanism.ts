import { DEFAULT_MANAGE_SUBSCRIPTION_MECHANISM } from "@/config/subscription";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { safeJsonParse } from "@/utils/commons/helpers";

interface TManageSubscriptionMechanism {
  mechanism: "v1" | "v2";
  manageType: "url" | "inline";
}

export const useHandleManageSubscriptionMechanism = () => {
  const { getValueSyncRemoteConfig, isReady } = useRemoteConfigContext();
  const rawManageSubscriptionMechanism = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.MANAGE_SUBSCRIPTION_MECHANISM
  );
  const manageSubscriptionMechanism =
    safeJsonParse<TManageSubscriptionMechanism>(
      rawManageSubscriptionMechanism
    ) || DEFAULT_MANAGE_SUBSCRIPTION_MECHANISM;

  const isPaddleManageSubscriptionMechanism =
    manageSubscriptionMechanism.mechanism === "v2";
  const isInlineManageSubscriptionMechanism =
    manageSubscriptionMechanism.manageType === "inline";
  return {
    isInlineManageSubscriptionMechanism,
    isPaddleManageSubscriptionMechanism,
    isReady,
  };
};
