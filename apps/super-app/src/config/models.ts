import type { AIModelItem } from "@/core/models/model";
import { EAIProviderModel, EAIValueModel } from "@/core/models/model";
import { generateRandomUUIDV4 } from "@/utils/commons/helpers";

export const IMAGE_MODELS: AIModelItem[] = [
  {
    availableRoles: ["premium"],
    badge: {
      color: "COLOR_GREEN",
      text: "cta.new",
      variant: "UI_VARIANT_SOFT",
    },
    description: "imageToImage.desc",
    id: generateRandomUUIDV4(),
    isActive: true,
    isAllowChatVision: true,
    logo: "https://static.vulcanlabs.co/chatsmith/models/openai.png",
    provider: EAIProviderModel.OpenAI,
    title: "gptImage2.title",
    value: EAIValueModel.GPT_Image_2,
  },
  {
    availableRoles: ["premium"],
    badge: {
      color: "COLOR_GREEN",
      text: "cta.new",
      variant: "UI_VARIANT_SOFT",
    },
    description: "imageToImage.desc",
    id: generateRandomUUIDV4(),
    isActive: true,
    isAllowChatVision: true,
    logo: "/icons/banana-model-ico.png",
    provider: EAIProviderModel.Banana,
    title: "bananaPro.title",
    value: EAIValueModel.Banana_Pro,
  },
  {
    availableRoles: ["premium"],
    badge: {
      color: "COLOR_GREEN",
      text: "cta.new",
      variant: "UI_VARIANT_SOFT",
    },
    description: "imageToImage.desc",
    id: generateRandomUUIDV4(),
    isActive: true,
    isAllowChatVision: true,
    logo: "/icons/banana-model-ico.png",
    provider: EAIProviderModel.Banana,
    title: "nanoBanana.title",
    value: EAIValueModel.Banana,
  },
  {
    availableRoles: ["premium"],
    badge: null,
    description: "imageToImage.desc",
    id: generateRandomUUIDV4(),
    isActive: false,
    isAllowChatVision: true,
    logo: "https://static.vulcanlabs.co/chatsmith/models/openai.png",
    provider: EAIProviderModel.OpenAI,
    title: "gptImage.title",
    value: EAIValueModel.GPT_Image,
  },
];
