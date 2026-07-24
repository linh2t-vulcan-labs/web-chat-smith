import type {
  EUseCase,
  TReadSourceDTO,
  TSyncDTO,
} from "@/core/http/dto/conversation";
import { Expose } from "@/libs/class-transformer";

import type { TMessageTemp } from "./conversation";
import type { EAIProviderModel, EAIValueModel } from "./model";

// Assistant Writing Entities
export type TAssistantLength = "short" | "medium" | "long";

export type TAssistantTone =
  | "formal"
  | "informal"
  | "optimistic"
  | "worried"
  | "friendly"
  | "curious"
  | "assertive"
  | "encouraging"
  | "surprised"
  | "cooperative";

export type TAssistantTechnique =
  | "none"
  | "5 Basic Objections framework"
  | "AIDA Copywriting"
  | "PAS Copywriting"
  | "Perfect webinar formula by Russell Brunson"
  | "PASTOR framework";

export interface TAssistantSetting {
  length: TAssistantLength;
  tone: TAssistantTone;
  technique: TAssistantTechnique;
  feedback: string;
  prompt: string;
}

export type TAssistantSettingKeys = keyof TAssistantSetting;

export interface TAssistantWriting {
  answer: TMessageTemp;
  status: "idle" | "loading" | "generating" | "submitted";
  settings: TAssistantSetting;
}

export type TAssistantWritingStates = Record<string, TAssistantWriting>;

// API entities
export class CreateAssistantWriting {
  @Expose({ name: "user_id" })
  userId!: string;

  @Expose({ name: "ref_id" })
  id!: string;

  @Expose({ name: "name" })
  name!: string;

  @Expose({ name: "use_case" })
  useCase!: string;

  @Expose({ name: "updated_at" })
  updatedAt!: string;

  @Expose({ name: "created_at" })
  createdAt!: string;
}

export interface TCreateAssistantWritingIdInput {
  use_case: EUseCase.ACADEMIC_WRITING;
}

export interface TUpdateAssistantWritingByIdInput {
  id: string;
  messages: TMessageTemp[];
  model: EAIValueModel;
  provider: EAIProviderModel;
  settings: TAssistantSetting;
  n?: string;
  nsfw_check?: boolean;
  sync?: TSyncDTO;
  readSource?: TReadSourceDTO;
}

export interface TGetAssistantWritingByIdInput {
  id: string;
}

export interface TGetAssistantWritingByIdV2Input {
  id: string;
  prev_cursor?: number | string;
}
