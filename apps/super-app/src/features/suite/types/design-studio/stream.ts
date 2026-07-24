import type { EventSourceMessage } from "eventsource-parser";

import type {
  SUITE_CREATIVE_STREAM_EVENT,
  SUITE_CREATIVE_STREAM_STAGE,
} from "@/features/suite/utils/constants/design-studio-stream";
// import { Exclude, Expose, Type } from "@/libs/class-transformer";

// import {
//   SuiteCreativeDirectionModel,
//   SuiteCreativeSuggestionItemModel,
// } from "./message";

export type TSuiteCreativeStreamEventName =
  (typeof SUITE_CREATIVE_STREAM_EVENT)[keyof typeof SUITE_CREATIVE_STREAM_EVENT];

export type TSuiteCreativeStreamStage =
  (typeof SUITE_CREATIVE_STREAM_STAGE)[keyof typeof SUITE_CREATIVE_STREAM_STAGE];

// step values align with BE stage names
export type TSuiteCreativeThinkingStep = TSuiteCreativeStreamStage;

// stage values for generating event — FE uses this to switch UI blocks
export type TSuiteCreativeGeneratingStage = TSuiteCreativeStreamStage;

// ─── Payload Models (class-transformer) ─────────────────────────────────────

// @Exclude()
// class SuiteCreativeMessageConfirmPayloadModel {
//   @Expose()
//   text!: string;
// }

// @Exclude()
// class SuiteCreativeThinkingPayloadModel {
//   @Expose()
//   step!: TSuiteCreativeThinkingStep;

//   @Expose()
//   text!: string;
// }

// @Exclude()
// class SuiteCreativeStrategyReadyPayloadModel {
//   @Expose({ name: "brand_name" })
//   brandName!: string;

//   @Expose()
//   industry!: string;

//   @Expose()
//   style!: string;

//   @Expose({ name: "logo_type" })
//   logoType!: string;

//   @Expose({ name: "color_palette" })
//   colorPalette!: string[];

//   @Expose()
//   typography!: string;

//   @Expose()
//   symbol!: string;

//   // number of images AI will generate this turn — FE uses to pre-size canvas grid
//   @Expose()
//   count!: number;
// }

// @Exclude()
// class SuiteCreativeGeneratingStageModel {
//   @Expose()
//   name!: TSuiteCreativeGeneratingStage;

//   @Expose()
//   status!: "in-progress" | "complete";

//   @Expose()
//   message?: string;
// }

// @Exclude()
// class SuiteCreativeGeneratingPayloadModel {
//   @Expose()
//   progress!: number;

//   @Expose()
//   @Type(() => SuiteCreativeGeneratingStageModel)
//   stage!: SuiteCreativeGeneratingStageModel;
// }

// @Exclude()
// class SuiteCreativeImageReadyPayloadModel {
//   @Expose({ name: "image_id" })
//   imageId!: string;

//   @Expose({ name: "download_url" })
//   downloadUrl!: string;

//   @Expose()
//   index!: number;

//   @Expose()
//   total!: number;
// }

// @Exclude()
// class SuiteCreativeDirectionOptionsPayloadModel {
//   @Expose()
//   @Type(() => SuiteCreativeDirectionModel)
//   directions!: SuiteCreativeDirectionModel[];
// }

// @Exclude()
// class SuiteCreativeSuggestionsPayloadModel {
//   @Expose()
//   @Type(() => SuiteCreativeSuggestionItemModel)
//   items!: SuiteCreativeSuggestionItemModel[];
// }

// @Exclude()
// class SuiteCreativeMessageDonePayloadModel {
//   @Expose({ name: "message_id" })
//   messageId!: string;
// }

// @Exclude()
// class SuiteCreativeMessageErrorPayloadModel {
//   @Expose()
//   message!: string;
// }

// ─── Raw SSE payload types (snake_case, as received from BE) ────────────────

interface TSuiteCreativeSSEStage {
  name: string;
  status?: "in-progress" | "complete";
  message?: string;
  progress?: number;
  estimated_total_seconds?: number;
}

export interface TSuiteCreativeSSEGeneratingPayload {
  payload: object;
  stage: TSuiteCreativeSSEStage & {
    name: TSuiteCreativeGeneratingStage | "started";
  };
  task_type: string;
}

export interface TSuiteCreativeSSEDirection {
  id: string;
  title: string;
  brand_name?: string;
  industry?: string;
  core_concept: string;
  visual_style: string;
  color_tone: string;
  typography: string[];
  layout: string;
  style: string;
}

export interface TSuiteCreativeSSEAnalysisReadyPayload {
  payload: {
    type?: "analysis";
    data?: {
      brand_name: string;
      color_palette: string[];
      count: number;
      industry: string;
      logo_type: string;
      mode_logo: boolean;
      original_query: string;
      style: string;
      symbol: string;
      typography: string;
    };
  };
  stage: TSuiteCreativeSSEStage;
  task_type: string;
}

export interface TSuiteCreativeSSEPlanReadyPayload {
  payload: {
    type?: "guideline";
    data?: {
      concept_direction: TSuiteCreativeSSEDirection[];
    };
  };
  stage: TSuiteCreativeSSEStage;
  task_type: string;
}

export interface TSuiteCreativeSSEOutputReadyPayload {
  payload: {
    type?: "images";
    data?: {
      images: {
        type: "url";
        value: string;
        download_url: string;
        image_id: string;
        index: number;
        total: number;
      }[];
    };
  };
  stage: TSuiteCreativeSSEStage;
  task_type: string;
}

export interface TSuiteCreativeSSEMessageSummaryPayload {
  payload: { text: string };
  stage: TSuiteCreativeSSEStage;
  task_type: string;
}

export interface TSuiteCreativeSSEMessageDonePayload {
  payload: object;
  stage: { name: string };
  task_type: string;
}

export interface TSuiteCreativeSSEMessageErrorPayload {
  payload: { message?: string };
  stage: { name: string };
  task_type: string;
}

// ─── Payload map ─────────────────────────────────────────────────────────────

export interface TSuiteCreativeSSEPayloadMap {
  [SUITE_CREATIVE_STREAM_EVENT.ANALYSIS_READY]: TSuiteCreativeSSEAnalysisReadyPayload;
  [SUITE_CREATIVE_STREAM_EVENT.PLAN_READY]: TSuiteCreativeSSEPlanReadyPayload;
  [SUITE_CREATIVE_STREAM_EVENT.OUTPUT_READY]: TSuiteCreativeSSEOutputReadyPayload;
  [SUITE_CREATIVE_STREAM_EVENT.MESSAGE_SUMMARY]: TSuiteCreativeSSEMessageSummaryPayload;
  [SUITE_CREATIVE_STREAM_EVENT.GENERATING]: TSuiteCreativeSSEGeneratingPayload;
  [SUITE_CREATIVE_STREAM_EVENT.MESSAGE_DONE]: TSuiteCreativeSSEMessageDonePayload;
  [SUITE_CREATIVE_STREAM_EVENT.MESSAGE_ERROR]: TSuiteCreativeSSEMessageErrorPayload;
  [SUITE_CREATIVE_STREAM_EVENT.STREAM_ERROR]: TSuiteCreativeSSEMessageErrorPayload;
  [SUITE_CREATIVE_STREAM_EVENT.AI_ERROR]: TSuiteCreativeSSEMessageErrorPayload;
}

// ─── Union event type ─────────────────────────────────────────────────────────

export type TSuiteCreativeStreamEvent =
  | {
      id: string;
      event: typeof SUITE_CREATIVE_STREAM_EVENT.ANALYSIS_READY;
      payload: TSuiteCreativeSSEAnalysisReadyPayload;
    }
  | {
      id: string;
      event: typeof SUITE_CREATIVE_STREAM_EVENT.PLAN_READY;
      payload: TSuiteCreativeSSEPlanReadyPayload;
    }
  | {
      id: string;
      event: typeof SUITE_CREATIVE_STREAM_EVENT.OUTPUT_READY;
      payload: TSuiteCreativeSSEOutputReadyPayload;
    }
  | {
      id: string;
      event: typeof SUITE_CREATIVE_STREAM_EVENT.MESSAGE_SUMMARY;
      payload: TSuiteCreativeSSEMessageSummaryPayload;
    }
  | {
      id: string;
      event: typeof SUITE_CREATIVE_STREAM_EVENT.GENERATING;
      payload: TSuiteCreativeSSEGeneratingPayload;
    }
  | {
      id: string;
      event: typeof SUITE_CREATIVE_STREAM_EVENT.MESSAGE_DONE;
      payload: TSuiteCreativeSSEMessageDonePayload;
    }
  | {
      id: string;
      event: typeof SUITE_CREATIVE_STREAM_EVENT.MESSAGE_ERROR;
      payload: TSuiteCreativeSSEMessageErrorPayload;
    };

export interface TSuiteCreativeStreamRawEvent {
  id: string;
  event: TSuiteCreativeStreamEventName;
  data: string;
}

// ─── Hook / service input types ───────────────────────────────────────────────

export interface TSuiteCreativeStreamMessageInput {
  projectId: string;
  messageId: string;
  lastEventId?: string;
}

export type TSuiteCreativeStreamMessageMutationInput =
  TSuiteCreativeStreamMessageInput & {
    handlers?: Partial<SSEHandlers>;
    signal?: AbortSignal;
  };

export interface TSuiteCreativeStreamMessageMutationResult {
  completed: boolean;
  lastEventId: string | null;
}

// ─── SSE Handlers ─────────────────────────────────────────────────────────────

export type SSEHandlers = {
  [TEventName in TSuiteCreativeStreamEventName]: (
    payload: TSuiteCreativeSSEPayloadMap[TEventName],
    event: EventSourceMessage
  ) => void;
};

export type TSuiteCreativeSSEHandlers = SSEHandlers;
