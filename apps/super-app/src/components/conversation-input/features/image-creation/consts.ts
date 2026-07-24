import {
  CHAT_SMITH_STYLE_OPTIONS,
  GPT_STYLE_OPTIONS,
  NANO_BANANA_PRO_STYLE_OPTIONS,
  NANO_BANANA_STYLE_VERSION_1_OPTIONS,
} from "@/config/ai-style-options";
import { EAIValueModel } from "@/core/models/model";

import type {
  TRemoteConfigListStyleOptions,
  // TRemoteConfigUIImageConfig,
} from "./types";

export const DEFAULT_LIST_STYLE_OPTIONS: TRemoteConfigListStyleOptions = {
  config: {
    version: "v1",
  },
  styles: {
    [EAIValueModel.Banana_Pro]: NANO_BANANA_PRO_STYLE_OPTIONS,
    [EAIValueModel.Banana]: NANO_BANANA_STYLE_VERSION_1_OPTIONS,
    [EAIValueModel.GPT_Image]: GPT_STYLE_OPTIONS,
    [EAIValueModel.GPT_Image_2]: GPT_STYLE_OPTIONS,
    [EAIValueModel.chatsmith]: CHAT_SMITH_STYLE_OPTIONS,
  },
};

// const DEFAULT_UI_IMAGE_CONFIG: TRemoteConfigUIImageConfig = {
//   enabled: false,
//   data: undefined,
// };
