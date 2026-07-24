import { EAIValueModel } from "@/core/models/model";

export const ModelCharacterCountCfg: Record<EAIValueModel, number> = {
  [EAIValueModel.GPT4o_Mini]: 131_000,
  [EAIValueModel.GPT5_Nano]: 131_000,
  [EAIValueModel.GPT4o]: 131_000,
  [EAIValueModel.Deepseek]: 131_000,
  [EAIValueModel.Gemini_Pro]: 131_000,
  [EAIValueModel.Gemini_Flash]: 131_000,
  [EAIValueModel.Grok]: 131_000,
  [EAIValueModel.Banana]: 131_000,
  [EAIValueModel.Banana_Pro]: 131_000,
  [EAIValueModel.GPT_Image]: 131_000,
  [EAIValueModel.GPT_Image_1_5]: 131_000,
  [EAIValueModel.GPT_Image_2]: 131_000,
  [EAIValueModel.Claude]: 131_000,
  [EAIValueModel.chatsmith]: 131_000,
  [EAIValueModel.None]: 0,
  [EAIValueModel.Get_Img]: 131_000,
  [EAIValueModel.Gemini_Flash_3_1_Flash_Lite]: 131_000,
};
