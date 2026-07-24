import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";

/** True only when Remote Config is ready AND the V2 payment flow is enabled. */
export function useIsPaymentFlowV2(): boolean {
  const { getValueSyncRemoteConfig, isReady } = useRemoteConfigContext();
  return (
    isReady &&
    getValueSyncRemoteConfig(REMOTE_CONFIG_KEY.FEATURE_PAYMENT_FLOW_V2)
  );
}
