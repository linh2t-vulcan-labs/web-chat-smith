import { SUBSCRIPTION_UI_VERSION } from "@/config/tracking-event";

export const SUBSCRIPTION_TIER = {
  TIER1: 1,
  TIER2: 2,
  TIER3: 3,
};

export const TIER_BY_OFFSET = [
  SUBSCRIPTION_TIER.TIER1,
  SUBSCRIPTION_TIER.TIER2,
  SUBSCRIPTION_TIER.TIER3,
] as const;

export const TRIAL_DS_VERSIONS = new Set([
  SUBSCRIPTION_UI_VERSION.V_5,
  SUBSCRIPTION_UI_VERSION.V_9,
  SUBSCRIPTION_UI_VERSION.V_10,
  SUBSCRIPTION_UI_VERSION.V_11,
]);

export const SUBSCRIPTION_MODELS = [
  {
    logo: "/images/ai-models/openai.svg",
    logoMobile: "/images/ai-models/openai-mobile.svg",
    name: "GPT-5.2",
  },
  // {
  //   name: "DeepSeek V3.2",
  //   logo: "/images/ai-models/deepseek.svg",
  //   logoMobile: "/images/ai-models/deepseek-mobile.svg",
  // },
  // {
  //   name: "Grok-4",
  //   logo: "/images/ai-models/grok.svg",
  //   logoMobile: "/images/ai-models/grok-mobile.svg",
  // },
  {
    logo: "/images/ai-models/gemini.svg",
    logoMobile: "/images/ai-models/gemini-mobile.svg",
    name: "Gemini 3 Pro",
  },
  {
    logo: "/images/ai-models/claude.svg",
    logoMobile: "/images/ai-models/claude-mobile.svg",
    name: "Claude Sonnet 4.6",
  },
];
export const SUBSCRIPTION_PRO_FEATURES_TIER1 = [
  "desktop.features.2.title",
  "desktop.features.3.title",
  "desktop.features.4.title",
  "desktop.features.5.title",
  "desktop.features.6.title",
];

export const SUBSCRIPTION_PRO_FEATURES = [
  {
    brief: "desktop.features.2.description",
    feature: "desktop.features.2.title",
    icon: "/icons/features-v2/brain.svg",
    limit: true,
  },
  {
    brief: "desktop.features.3.description",
    feature: "desktop.features.3.title",
    icon: "/icons/features-v2/deep-research.svg",
    mobileHideBrief: true,
  },
  {
    brief: "desktop.features.4.description",
    feature: "desktop.features.4.title",
    icon: "/icons/features-v2/sync.svg",
    mobileHideBrief: true,
  },
  {
    brief: "desktop.features.5.description",
    feature: "desktop.features.5.title",
    icon: "/icons/features-v2/upload.svg",
    mobileHideBrief: true,
  },
  {
    brief: "desktop.features.6.description",
    feature: "desktop.features.6.title",
    icon: "/icons/features-v2/air.svg",
    mobileHideBrief: true,
  },
];

export const SUBSCRIPTION_PRO_FEATURES_TIER2 = [
  {
    brief: "desktop.featureV2.1.description",
    feature: "desktop.featureV2.1.title",
    id: "1",
    image: "/images/subscription/subscription-feature-1.png",
  },
  {
    brief: "desktop.featureV2.2.description",
    feature: "desktop.featureV2.2.title",
    id: "2",
    image: "/images/subscription/subscription-feature-2.png",
  },
  {
    brief: "desktop.featureV2.3.description",
    feature: "desktop.featureV2.3.title",
    id: "3",
    image: "/images/subscription/subscription-feature-3.png",
  },
  {
    brief: "desktop.featureV2.4.description",
    feature: "desktop.featureV2.4.title",
    id: "4",
    image: "/images/subscription/subscription-feature-4.png",
  },
  {
    brief: "desktop.featureV2.5.description",
    feature: "desktop.featureV2.5.title",
    id: "5",
    image: "/images/subscription/subscription-feature-5.png",
  },
];
