import { Exclude, Expose, Transform, Type } from "@/libs/class-transformer";
import { generateRandomUUIDV4 } from "@/utils/commons/helpers";

export interface TSelectedModel {
  model: EAIValueModel;
  provider: EAIProviderModel;
}

export enum EAIProviderModel {
  OpenAI = "openai",
  Deepseek = "deepseek",
  Grok = "grok",
  Gemini = "gemini",
  Banana = "banana",
  chatsmith = "chatsmith",
  GetImg = "get_img",
  Claude = "claude",
}

export enum EAIValueModel {
  GPT4o = "gpt-4o",
  GPT4o_Mini = "gpt-4o-mini",
  GPT5_Nano = "gpt-5-nano",
  Deepseek = "deepseek-reasoner",
  Grok = "grok",
  Gemini_Flash = "gemini-1.5-flash",
  Gemini_Flash_3_1_Flash_Lite = "gemini-3.1-flash-lite",
  Gemini_Pro = "gemini-1.5-pro",
  Banana = "gemini-2.5-flash-image",
  Banana_Pro = "gemini-3-pro-image-preview",
  GPT_Image = "gpt-image-1",
  GPT_Image_1_5 = "gpt-image-1.5",
  GPT_Image_2 = "gpt-image-2",
  Claude = "claude-haiku-4-5",
  chatsmith = "chatsmith",
  None = "",
  Get_Img = "getimg",
}

export class AIModelItem {
  @Expose()
  @Transform(() => generateRandomUUIDV4(), { toClassOnly: true })
  id!: string;

  @Expose()
  provider!: EAIProviderModel;

  @Expose({ name: "model" })
  value!: EAIValueModel;

  @Expose()
  title!: string;

  @Expose()
  description!: string;

  @Expose()
  logo!: string;

  @Expose()
  badge!: {
    text: string;
    variant: number | string;
    color: number | string;
  } | null;

  @Expose({ name: "available_roles" })
  availableRoles!: string[];

  @Expose({ name: "status" })
  @Transform(({ value }) => value === "MODEL_STATUS_ACTIVE")
  isActive!: boolean;

  @Expose({ name: "chat_vision" })
  isAllowChatVision = false;
}

export class AIModel {
  @Expose()
  @Transform(() => generateRandomUUIDV4(), { toClassOnly: true })
  id!: string;

  @Expose({ name: "name" })
  value!: EAIProviderModel;

  @Expose()
  title!: string;

  @Expose()
  @Type(() => AIModelItem)
  models!: AIModelItem[];
}

@Exclude()
export class CustomResponseItem {
  @Expose()
  id!: string;

  @Expose()
  type!: string;

  @Expose()
  description!: string;

  @Expose()
  icon!: string;

  @Expose()
  preview!: string;

  @Expose()
  title?: string;
}

@Exclude()
export class CustomResponseModel {
  @Expose()
  @Type(() => CustomResponseItem)
  prompts!: CustomResponseItem[];

  @Expose({ name: "current_choice_prompt_type" })
  currentChoicePromptType!: string;
}
