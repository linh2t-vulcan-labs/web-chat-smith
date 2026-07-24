// import type { TPackageDescriptionV2Props } from "@/components/package-description-v2/types";

export const PRODUCT_DESCRIPTION_DS_V2_OPTIONS = [
  {
    description: "Access smartest AI models: DeepSeek, Grok, Gemini and more",
    icon: "/icons/outlined/subscription01.svg",
    id: "1",
  },
  {
    description:
      "Full access to advanced tools: Real-time search, deep research, image generation",
    icon: "/icons/outlined/subscription02.svg",
    id: "2",
  },
  {
    description: "Unlimited messages with all models",
    icon: "/icons/outlined/subscription03.svg",
    id: "3",
  },
  {
    description: "Unlimited file uploads",
    icon: "/icons/outlined/subscription04.svg",
    id: "4",
  },
  {
    description: "Prioritize to experience new features",
    icon: "/icons/outlined/subscription05.svg",
    id: "5",
  },
] as const;

// type TProductDescriptionOptions = Omit<
//   TPackageDescriptionV2Props,
//   "isShowXIcon"
// >;

// const PRODUCT_DESCRIPTION_DS_V3_OPTIONS: (TProductDescriptionOptions & {
//   id: string;
// })[] = [
//   {
//     id: "1",
//     icon: "/icons/outlined/subscription01.svg",
//     xIconPath: "/icons/filled/ds-premium.svg",
//     premiumIconPath: "/icons/filled/ds-premium.svg",
//     content: "Utilize model GPT-4o mini & Gemini 1.5 Flash",
//   },
//   {
//     id: "2",
//     icon: "/icons/outlined/subscription01.svg",
//     premiumIconPath: "/icons/filled/ds-premium.svg",
//     content: "Access smartest AI models: DeepSeek, Grok, Gemini and more",
//   },
//   {
//     id: "3",
//     icon: "/icons/outlined/subscription02.svg",
//     highlightContent: "Full access",
//     premiumIconPath: "/icons/filled/ds-premium.svg",
//     content:
//       "Full access to advanced tools: Real-time search, deep research, image generation",
//   },
//   {
//     id: "4",
//     icon: "/icons/outlined/subscription03.svg",
//     highlightContent: "Unlimited",
//     premiumIconPath: "/icons/filled/ds-premium.svg",
//     content: "Unlimited messages with all models",
//   },
//   {
//     id: "5",
//     icon: "/icons/outlined/subscription04.svg",
//     highlightContent: "Unlimited",
//     premiumIconPath: "/icons/filled/ds-premium.svg",
//     content: "Unlimited file uploads",
//   },
//   {
//     id: "6",
//     icon: "/icons/outlined/subscription05.svg",
//     premiumIconPath: "/icons/filled/ds-premium.svg",
//     content: "Prioritize to experience new features",
//   },
// ];

// const PRODUCT_DESCRIPTION_DS_V3_MOBILE_OPTIONS: (TProductDescriptionOptions & {
//   id: string;
// })[] = [
//   {
//     id: "1",
//     icon: "/icons/outlined/subscription01.svg",
//     content: "Built on GPT-4o, DeepSeek, Grok, Gemini",
//   },
//   {
//     id: "2",
//     icon: "/icons/outlined/subscription05.svg",
//     content: "Prioritize to experience new features",
//   },
//   {
//     id: "3",
//     icon: "/icons/outlined/subscription03.svg",
//     content: "Unlimited messages and file uploads",
//   },
//   {
//     id: "4",
//     icon: "/icons/outlined/subscription04.svg",
//     content: "Optimize your job and study",
//   },
// ];

// DS Version 5
// const freeBenefits = [
//   {
//     text: "Daily limited AI chat messages with GPT-4o mini and Gemini 2.5 Flash Lite (limited access to Writing assistant & File uploads)",
//   },
// ];

export const premiumBenefits = [
  {
    highlights: ["GPT-5"],
    text: "Unlimited access to AI Chat messages (GPT-5)",
  },
  {
    highlights: ["Gemini 2.5 Pro", "Grok-4", "DeepSeek"],
    text: "Unlimited access to other advanced AI Models: Gemini 2.5 Pro, Grok-4, DeepSeek",
  },
  {
    highlights: ["Unlimited"],
    text: "Unlimited access to File Uploads (png, jpg, jpeg, pdf, etc)",
  },
  {
    highlights: ["Unlimited", "Writing Assistant"],
    text: "Unlimited access to Writing Assistant",
  },
  {
    highlights: ["Deep Research"],
    text: "Access to Deep Research",
  },
  {
    highlights: ["Art Generation"],
    text: "Access to Art Generation",
  },
];

export const upcomingFeatures = [
  {
    text: "Real-time Search",
  },
  {
    text: "Paraphrase AI Assistant",
  },
  {
    text: "Homework AI Assistant",
  },
  {
    text: "Meeting AI Assistant",
  },
  {
    text: "Resume Builder AI Assistant",
  },
  {
    text: "Translator AI Assistant",
  },
];
