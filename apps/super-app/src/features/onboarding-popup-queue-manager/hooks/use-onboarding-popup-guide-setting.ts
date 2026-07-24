import { useRemoteConfigContext } from "@/libs/firebase/provider";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { safeJsonParse } from "@/utils/commons/helpers";

import type { TPopupItemConfig } from "../store/types";

type TOnboardingPopupGuideSetting = Pick<
  TPopupItemConfig,
  "id" | "priority" | "delay" | "dependencies"
>;

export const useOnboardingPopupGuideSetting = () => {
  const { getValueSyncRemoteConfig } = useRemoteConfigContext();
  const onboardingPopupGuideSettingRaw = getValueSyncRemoteConfig(
    REMOTE_CONFIG_KEY.ONBOARDING_POPUP_GUIDE_SETTING
  );

  const onboardingPopupGuideSetting =
    safeJsonParse<TOnboardingPopupGuideSetting[]>(
      onboardingPopupGuideSettingRaw
    ) || [];

  return onboardingPopupGuideSetting;
};
