import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";

export function useIsEnablePaddleCheckout() {
  const { getValueSyncRemoteConfig, isReady } = useRemoteConfigContext();
  const enablePaddleCheckoutFeature = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.FEATURE_PADDLE_CHECKOUT
  );

  return isReady && enablePaddleCheckoutFeature;
}
