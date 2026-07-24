import { Expose, Type } from "@/libs/class-transformer";

import type { TSuiteCreativeMessageModeHint } from "../message";

export interface TSuiteCreativeDirectionDTO {
  id: string;
  title: string;
  brand_name: string;
  industry: string;
  style: string;
  core_concept: string;
  visual_style: string;
  color_tone: string;
  typography: string[];
  layout: string;
}

export interface TSuiteCreativeUserMessageMetadataDTO {
  attached_image_urls: string[];
  target_image_id: string;
  target_image_url: string;
  mask: { x: number; y: number; width: number; height: number } | null;
  direction_hint: string;
  template_id: string;
  template_image_url: string;
  display_images_urls: string[];
}

export interface TSuiteCreativeAssistantMessageMetadataDTO {
  options: TSuiteCreativeDirectionDTO[];
  generated_image_urls: string[];
  analysis: unknown | null;
  failed_reason: string;
}

export type TSuiteCreativeMessageMetadataDTO =
  | TSuiteCreativeUserMessageMetadataDTO
  | TSuiteCreativeAssistantMessageMetadataDTO;

export interface TSuiteCreativeMessageDTO {
  id: string;
  project_id: string;
  role: "user" | "assistant";
  status: "pending" | "processing" | "done" | "failed" | "cancelled";
  content: string;
  created_at: string;
  metadata?: TSuiteCreativeMessageMetadataDTO | null;
}

class SuiteCreativeMaskPayloadDTO {
  @Expose()
  x!: number;

  @Expose()
  y!: number;

  @Expose()
  width!: number;

  @Expose()
  height!: number;
}

export class SuiteCreativePostMessagePayloadDTO {
  @Expose()
  content!: string;

  @Expose({ name: "modeHint" })
  mode_hint?: TSuiteCreativeMessageModeHint;

  @Expose({ name: "referenceUploadIds" })
  reference_upload_ids?: string[];

  @Expose({ name: "displayImageIds" })
  display_image_ids?: string[];

  @Expose({ name: "targetImageId" })
  target_image_id?: string | null;

  @Expose({ name: "directionHint" })
  direction_hint?: string | null;

  @Expose({ name: "templateId" })
  template_id?: string | null;

  @Expose()
  @Type(() => SuiteCreativeMaskPayloadDTO)
  mask?: SuiteCreativeMaskPayloadDTO;
}

export class SuiteCreativeGetMessageHistoryQueryDTO {
  @Expose({ name: "pageSize" })
  page_size?: number;

  @Expose({ name: "pageToken" })
  page_token?: string | null;
}

export interface TSuiteCreativeSuggestionItemDTO {
  text: string;
  mode_hint: string;
}

export interface TSuiteCreativePostMessageResponseDTO {
  message_id: string;
  user_message: TSuiteCreativeMessageDTO;
}

export interface TSuiteCreativeGetMessageHistoryResponseDTO {
  messages: TSuiteCreativeMessageDTO[];
  next_page_token: string | null;
}

export type TSuiteCreativeDeleteMessageResponseDTO = Record<string, never>;

export interface TSuiteCreativeGetMessageSuggestionsResponseDTO {
  items: TSuiteCreativeSuggestionItemDTO[];
}
