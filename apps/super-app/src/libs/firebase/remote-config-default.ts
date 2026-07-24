import { DEFAULT_LIST_STYLE_OPTIONS } from "@/components/conversation-input/features/image-creation/consts";
import { DEFAULT_REMOTE_CONFIG_WHAT_NEWS_POPUP_OPTIONS } from "@/components/what-news-modal/constant";
import { DEFAULT_MANAGE_SUBSCRIPTION_MECHANISM } from "@/config/subscription";
import { DEFAULT_WELCOME_CONVERSATION_SUGGESTIONS } from "@/config/suggestion-options";
import { defaultWebFeatures } from "@/config/web-features";
import { EMessageFeedbackOptionType } from "@/core/models/message-feedback";
import { REMOTE_CONFIG_KEY } from "@/libs/firebase/remote-config-key";
import { DISCORD_COMMUNITY } from "@/utils/constants/url";

export const DEFAULT_FLOATING_UPGRADE_CONFIG = {
  enabled: false,
  initialShowThreshold: 4,
  showInterval: 2,
};

export const DEFAULT_NOTIFICATION_CONFIG = {
  newUserRetryMs: 86_400_000, // 24h
  newUserThresholdDays: null,
  popupDelayMs: 86_400_000, // 24h
};

// const DEFAULT_SYNC_CROSS_PLATFORM = {
//   isSync: false,
// };

export const DEFAULT_FREE_USER_USAGE_CONFIG = {
  enabled: false,
};

export interface TRemoteConfigDefaultValue {
  [REMOTE_CONFIG_KEY.SIDEBAR_DOWNLOAD_APP_LABEL]: string;
  [REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_INFO]: string;
  [REMOTE_CONFIG_KEY.MESSAGE_FEEDBACK_OPTIONS]: string;
  [REMOTE_CONFIG_KEY.SOCIAL_LINKS]: string;
  [REMOTE_CONFIG_KEY.WHATS_NEW_OPTIONS]: string;
  [REMOTE_CONFIG_KEY.WEB_FEATURES]: string;
  [REMOTE_CONFIG_KEY.FLOATING_UPGRADE_CONFIG]: string;
  [REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_UI_VERSION]: number;
  [REMOTE_CONFIG_KEY.WHAT_NEWS_POPUP_OPTIONS]: string;
  [REMOTE_CONFIG_KEY.CONVERSATION_SUGGESTION_OPTIONS]: string;
  [REMOTE_CONFIG_KEY.LIST_STYLE_OPTIONS]: string;
  [REMOTE_CONFIG_KEY.NOTIFICATION_CONFIG]: string;
  [REMOTE_CONFIG_KEY.MANAGE_SUBSCRIPTION_MECHANISM]: string;
  [REMOTE_CONFIG_KEY.ONBOARDING_POPUP_GUIDE_SETTING]: string;
  [REMOTE_CONFIG_KEY.SYNC_BETA]: boolean;
  [REMOTE_CONFIG_KEY.FREE_USER_USAGE_CONFIG]: string;
  [REMOTE_CONFIG_KEY.FEATURE_PADDLE_CHECKOUT]: boolean;
  [REMOTE_CONFIG_KEY.CHAT_MEMORY_USED]: boolean;
  [REMOTE_CONFIG_KEY.ENABLE_PADDLE_RETAIN]: boolean;
  [REMOTE_CONFIG_KEY.UI_IMAGE_CONFIG]: string;
  [REMOTE_CONFIG_KEY.FEATURE_PAYMENT_FLOW_V2]: boolean;
  [REMOTE_CONFIG_KEY.ENABLE_THEME_TOGGLE]: boolean;
  [REMOTE_CONFIG_KEY.ENABLE_DESIGN_STUDIO_TOGGLE]: boolean;
}

export const remoteConfigDefaultValue: TRemoteConfigDefaultValue = {
  [REMOTE_CONFIG_KEY.SIDEBAR_DOWNLOAD_APP_LABEL]: "Get App",
  [REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_INFO]: "v1",
  [REMOTE_CONFIG_KEY.PACKAGE_SUBSCRIPTION_UI_VERSION]: 3,
  [REMOTE_CONFIG_KEY.SOCIAL_LINKS]: JSON.stringify({
    discord: DISCORD_COMMUNITY,
  }),
  [REMOTE_CONFIG_KEY.NOTIFICATION_CONFIG]: JSON.stringify(
    DEFAULT_NOTIFICATION_CONFIG
  ),
  [REMOTE_CONFIG_KEY.MESSAGE_FEEDBACK_OPTIONS]: JSON.stringify([
    {
      content:
        "modal.feedback.options.tooShallow,modal.feedback.options.untrustedSources,modal.feedback.options.outdatedInfo,modal.feedback.options.hardToUnderstand",
      id: "1",
      type: EMessageFeedbackOptionType.RESEARCH,
    },
    {
      content:
        "modal.feedback.options.wrongStyle,modal.feedback.options.badComposition,modal.feedback.options.wrongSubject,modal.feedback.options.looksBroken",
      id: "2",
      type: EMessageFeedbackOptionType.IMAGE_CREATION,
    },
    {
      content:
        "modal.feedback.options.offTopic,modal.feedback.options.incorrectFacts,modal.feedback.options.hardToUnderstand,modal.feedback.options.biased",
      id: "3",
      type: EMessageFeedbackOptionType.NORMAL,
    },
    {
      content:
        "modal.feedback.options.didntMatchAsked,modal.feedback.options.notUseful,modal.feedback.options.lackingDetail,modal.feedback.options.poorQuality",
      id: "4",
      type: EMessageFeedbackOptionType.COMMON,
    },
  ]),
  [REMOTE_CONFIG_KEY.WEB_FEATURES]: JSON.stringify(defaultWebFeatures),
  [REMOTE_CONFIG_KEY.WHATS_NEW_OPTIONS]: JSON.stringify([
    {
      createdAt: "2025-07-30T13:00:30.000Z",
      description:
        "Connect with others, get support, share ideas, and be part of something exciting. Discover everything happening in the ChatSmith server!",
      id: "1",
      isEnabled: true,
      isShowDetail: true,
      label: "NEW FEATURE",
      metadata: {
        externalLink: "https://discord.gg/RzYnW6r5",
      },
      title: "Join the ChatSmith Community on Discord",
      video:
        "https://stg-static.vulcanlabs.co/chatsmith/what-news/discord_community.mp4",
    },
    {
      createdAt: "2025-07-08T13:00:30.000Z",
      description:
        "Generate detailed, cited reports on any topic in minutes. Tap to discover now!",
      id: "2",
      isEnabled: true,
      label: "NEW FEATURE",
      title: "📚 Deep Research, Done Instantly",
    },
    {
      createdAt: "2025-07-08T14:51:38.795Z",
      description:
        "Turn your ideas into beautiful visuals in seconds. Tap to explore the new AI Art feature!",
      id: "3",
      isEnabled: true,
      label: "NEW FEATURE",
      title: "🎨 Create Stunning Images with AI",
    },
    {
      createdAt: "2025-07-08T14:51:38.795Z",
      description:
        "Get the latest updates and insights pulled live from the web. Tap to see what’s new!",
      id: "4",
      isEnabled: false,
      label: "NEW FEATURE",
      title: "🔍 Real-Time Search Is Here",
    },
    {
      createdAt: "2025-06-28T14:45:30.000Z",
      description:
        "Upload any PDF and ask questions like you're chatting with a person. Tap to explore the latest update!",
      id: "5",
      isEnabled: true,
      label: "NEW FEATURE",
      title: "📄 Chat with PDFs Now Supported",
    },
  ]),
  [REMOTE_CONFIG_KEY.FLOATING_UPGRADE_CONFIG]: JSON.stringify(
    DEFAULT_FLOATING_UPGRADE_CONFIG
  ),
  [REMOTE_CONFIG_KEY.WHAT_NEWS_POPUP_OPTIONS]: JSON.stringify(
    DEFAULT_REMOTE_CONFIG_WHAT_NEWS_POPUP_OPTIONS
  ),
  [REMOTE_CONFIG_KEY.CONVERSATION_SUGGESTION_OPTIONS]: JSON.stringify(
    DEFAULT_WELCOME_CONVERSATION_SUGGESTIONS
  ),
  [REMOTE_CONFIG_KEY.LIST_STYLE_OPTIONS]: JSON.stringify(
    DEFAULT_LIST_STYLE_OPTIONS
  ),
  [REMOTE_CONFIG_KEY.MANAGE_SUBSCRIPTION_MECHANISM]: JSON.stringify(
    DEFAULT_MANAGE_SUBSCRIPTION_MECHANISM
  ),
  [REMOTE_CONFIG_KEY.ONBOARDING_POPUP_GUIDE_SETTING]: JSON.stringify([]),
  [REMOTE_CONFIG_KEY.SYNC_BETA]: false,
  [REMOTE_CONFIG_KEY.FREE_USER_USAGE_CONFIG]: JSON.stringify({
    enabled: false,
  }),
  [REMOTE_CONFIG_KEY.FEATURE_PADDLE_CHECKOUT]: false,
  [REMOTE_CONFIG_KEY.CHAT_MEMORY_USED]: false,
  [REMOTE_CONFIG_KEY.ENABLE_PADDLE_RETAIN]: false,
  [REMOTE_CONFIG_KEY.ENABLE_THEME_TOGGLE]: false,
  [REMOTE_CONFIG_KEY.ENABLE_DESIGN_STUDIO_TOGGLE]: false,
  [REMOTE_CONFIG_KEY.UI_IMAGE_CONFIG]: "",
  [REMOTE_CONFIG_KEY.FEATURE_PAYMENT_FLOW_V2]: false, // false = V1 (safe default)
};
