import { Exclude, Expose, Type } from "@/libs/class-transformer";

export type TSuiteCreativeMessageRole = "user" | "assistant";

export type TSuiteCreativeMessageStatus =
  | "pending"
  | "processing"
  | "done"
  | "failed"
  | "cancelled";

export type TSuiteCreativeMessageModeHint =
  | "create"
  | "edit"
  | "upscale"
  | "variation"
  | "inpaint";

export interface TSuiteCreativeMaskInput {
  x: number;
  y: number;
  width: number;
  height: number;
}

@Exclude()
export class SuiteCreativeDirectionModel {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose({ name: "brand_name" })
  brandName!: string;

  @Expose()
  industry!: string;

  @Expose()
  style!: string;

  @Expose({ name: "core_concept" })
  coreConcept!: string;

  @Expose({ name: "visual_style" })
  visualStyle!: string;

  @Expose({ name: "color_tone" })
  colorTone!: string;

  // array — first element: brand name font, subsequent: tagline
  @Expose()
  typography!: string[];

  @Expose()
  layout!: string;
}

@Exclude()
class SuiteCreativeMessageAnalysisModel {
  @Expose({ name: "brand_name" })
  brandName!: string;

  @Expose()
  industry!: string;

  @Expose()
  style!: string;

  @Expose({ name: "logo_type" })
  logoType!: string;

  @Expose({ name: "color_palette" })
  colorPalette!: string[];

  // single string here (unlike SuiteCreativeDirectionModel.typography which is string[])
  @Expose()
  typography!: string;

  @Expose()
  symbol!: string;

  // Number of images the turn plans to generate — used to pre-render that many canvas skeletons.
  @Expose()
  count!: number;

  @Expose({ name: "mode_logo" })
  modeLogo!: boolean;

  @Expose({ name: "original_query" })
  originalQuery!: string;
}

@Exclude()
class SuiteCreativeMessageMetadataModel {
  // Assistant message fields
  // The opening chat bubble shown BEFORE guideline/generated (root `content` holds the closing
  // summary shown AFTER generated). Either may be present independently.
  @Expose()
  intention?: string;

  @Expose()
  @Type(() => SuiteCreativeDirectionModel)
  options?: SuiteCreativeDirectionModel[];

  @Expose({ name: "generated_image_urls" })
  generatedImageUrls?: string[];

  @Expose()
  @Type(() => SuiteCreativeMessageAnalysisModel)
  analysis?: SuiteCreativeMessageAnalysisModel | null;

  @Expose({ name: "failed_reason" })
  failedReason?: string;

  // User message fields
  @Expose({ name: "attached_image_urls" })
  attachedImageUrls?: string[];

  @Expose({ name: "target_image_id" })
  targetImageId?: string;

  @Expose({ name: "target_image_url" })
  targetImageUrl?: string;

  @Expose({ name: "direction_hint" })
  directionHint?: string;

  @Expose({ name: "template_id" })
  templateId?: string;

  @Expose({ name: "template_image_url" })
  templateImageUrl?: string;

  @Expose({ name: "display_images_urls" })
  displayImagesUrls?: string[];

  @Expose()
  mask?: { x: number; y: number; width: number; height: number } | null;
}

@Exclude()
export class SuiteCreativeMessageModel {
  @Expose()
  id!: string;

  @Expose({ name: "project_id" })
  projectId!: string;

  @Expose()
  role!: TSuiteCreativeMessageRole;

  @Expose()
  status!: TSuiteCreativeMessageStatus;

  @Expose()
  content!: string;

  @Expose({ name: "created_at" })
  createdAt!: string;

  @Expose()
  @Type(() => SuiteCreativeMessageMetadataModel)
  metadata?: SuiteCreativeMessageMetadataModel | null;

  // Last SSE event id of this message's stream — used to resume a pending/processing turn.
  @Expose({ name: "last_event_id" })
  lastEventId?: string;
}

@Exclude()
export class SuiteCreativeSuggestionItemModel {
  @Expose()
  text!: string;

  @Expose({ name: "mode_hint" })
  modeHint!: string;
}

export interface TSuiteCreativePostMessageInput {
  projectId: string;
  content: string;
  modeHint?: TSuiteCreativeMessageModeHint;
  referenceUploadIds?: string[];
  displayImageIds?: string[];
  targetImageId?: string | null;
  directionHint?: string | null;
  templateId?: string | null;
  mask?: TSuiteCreativeMaskInput;
}

export interface TSuiteCreativeGetMessageHistoryInput {
  projectId: string;
  pageSize?: number;
  pageToken?: string | null;
}

export type TSuiteCreativeMessageHistoryQueryInput = Omit<
  TSuiteCreativeGetMessageHistoryInput,
  "pageToken"
>;

export interface TSuiteCreativeDeleteMessageInput {
  projectId: string;
  messageId: string;
}

export interface TSuiteCreativeGetMessageSuggestionsInput {
  projectId: string;
  messageId: string;
}

export interface TSuiteCreativePostMessageResult {
  messageId: string;
  userMessage: SuiteCreativeMessageModel;
}

export interface TSuiteCreativeGetMessageHistoryResult {
  messages: SuiteCreativeMessageModel[];
  nextPageToken: string | null;
}

export interface TSuiteCreativeGetMessageSuggestionsResult {
  items: SuiteCreativeSuggestionItemModel[];
}
