"use client";

import { useEffect } from "react";

import useMobileDetect from "@/hooks/use-mobile-detect";
import { useRouter } from "@/i18n/navigation";
import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { CONVERSATION_URL, GUEST_URL } from "@/utils/constants/url";

// Redirects to the appropriate home when the Creative Suite feature flag is off or the device is mobile.
// isAuthenticated must be passed by the caller — AuthContext is absent in guest layouts.
export function useSuiteFeatureGuard({
  isAuthenticated,
}: {
  isAuthenticated: boolean;
}) {
  const router = useRouter();
  const { getValueSyncRemoteConfig, isReady } = useRemoteConfigContext();
  const isEnabled = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.ENABLE_DESIGN_STUDIO_TOGGLE
  );
  const { isMobile } = useMobileDetect();
  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (!isEnabled || isMobile) {
      const target = isAuthenticated ? CONVERSATION_URL : GUEST_URL;
      router.replace(target);
    }
  }, [isReady, isEnabled, isMobile, isAuthenticated, router]);
}
