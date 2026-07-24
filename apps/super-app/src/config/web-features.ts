import { WEB_FEATURE_KEYS } from "@cs/flags/keys";

export { WEB_FEATURE_KEYS as WEB_FEATURE_CONFIG_KEYS } from "@cs/flags/keys";

export interface TWebFeatureItem {
  isEnabled: boolean;
  description: string;
}

export interface TWebFeatures {
  [WEB_FEATURE_KEYS.FEATURE_SURVEY_REQUEST]: TWebFeatureItem;
  [WEB_FEATURE_KEYS.FEATURE_FAQ]: TWebFeatureItem;
  [WEB_FEATURE_KEYS.SOCIALS_LINK]: TWebFeatureItem;
  [WEB_FEATURE_KEYS.CUSTOM_RESPONSE]: TWebFeatureItem;
  [WEB_FEATURE_KEYS.SIGN_IN_ONE_TAP]: TWebFeatureItem;
  [WEB_FEATURE_KEYS.SYNC_HISTORY]: TWebFeatureItem;
}

export const defaultWebFeatures: TWebFeatures = {
  [WEB_FEATURE_KEYS.FEATURE_SURVEY_REQUEST]: {
    description:
      "Gathers user feedback to help us improve and prioritize new feature development.",
    isEnabled: true,
  },
  [WEB_FEATURE_KEYS.FEATURE_FAQ]: {
    description: "Shows or hides FAQ feature on the website.",
    isEnabled: true,
  },
  [WEB_FEATURE_KEYS.SOCIALS_LINK]: {
    description:
      "Shows or hides social media links on the website, such as Discord.",
    isEnabled: false,
  },
  [WEB_FEATURE_KEYS.CUSTOM_RESPONSE]: {
    description: "Shows or hides custom response feature on the website.",
    isEnabled: false,
  },
  [WEB_FEATURE_KEYS.SIGN_IN_ONE_TAP]: {
    description:
      "Enables Google One Tap sign-in on the website for faster and easier user authentication.",
    isEnabled: false,
  },
  [WEB_FEATURE_KEYS.SYNC_HISTORY]: {
    description:
      "Enables or disables the visibility of Sync History user interface elements.",
    isEnabled: false,
  },
};
