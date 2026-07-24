import {
  SUITE_BLOCK_KIND,
  SUITE_CREATIVE_STREAM_STAGE,
  SUITE_CREATIVE_TASK_TYPE,
} from "@/features/suite/utils/constants/design-studio-stream";
import type {
  SuiteBlockKind,
  SuiteTaskType,
} from "@/features/suite/utils/constants/design-studio-stream";

import type { SuiteStageName } from "./parse-frame";

export interface StageDescriptor {
  /** Block to enqueue when this stage starts (generating in-progress / message.summary / etc.). */
  block: SuiteBlockKind;
  /** For "generating" stages: which block output.ready builds (image/video/…). */
  output?: SuiteBlockKind;
}

/** Per task_type, every stage that task emits is declared explicitly (Approach A — no inheritance). */
export type TaskPipeline = Partial<Record<SuiteStageName, StageDescriptor>>;

export const SUITE_PIPELINES: Record<SuiteTaskType, TaskPipeline> = {
  [SUITE_CREATIVE_TASK_TYPE.LOGO_DESIGN]: {
    [SUITE_CREATIVE_STREAM_STAGE.CHAT]: { block: SUITE_BLOCK_KIND.BOT },
    [SUITE_CREATIVE_STREAM_STAGE.ANALYZE_LOGO_REQUEST]: {
      block: SUITE_BLOCK_KIND.THINKING,
    },
    [SUITE_CREATIVE_STREAM_STAGE.GENERATE_DESIGN_GUIDELINE]: {
      block: SUITE_BLOCK_KIND.GUIDELINE,
    },
    [SUITE_CREATIVE_STREAM_STAGE.GENERATE_LOGO]: {
      block: SUITE_BLOCK_KIND.GENERATING,
      output: SUITE_BLOCK_KIND.GENERATED_IMAGE,
    },
    [SUITE_CREATIVE_STREAM_STAGE.GENERATE_IMAGE]: {
      block: SUITE_BLOCK_KIND.GENERATING,
      output: SUITE_BLOCK_KIND.GENERATED_IMAGE,
    },
    [SUITE_CREATIVE_STREAM_STAGE.EDIT_LOGO]: {
      block: SUITE_BLOCK_KIND.GENERATING,
      output: SUITE_BLOCK_KIND.GENERATED_IMAGE,
    },
  },
  // Future task types declare their own full stage map here, e.g.:
  // [SUITE_CREATIVE_TASK_TYPE.VIDEO_GEN]: {
  //   chat: { block: BOT },
  //   write_script: { block: THINKING },
  //   generate_video: { block: GENERATING, output: GENERATED_VIDEO },
  // },
};

const DEFAULT_TASK_TYPE: SuiteTaskType = SUITE_CREATIVE_TASK_TYPE.LOGO_DESIGN;

const isKnownTaskType = (taskType: string): taskType is SuiteTaskType =>
  taskType in SUITE_PIPELINES;

/** Resolve a stage to its block descriptor for a given task_type (falls back to logo_design). */
export const resolveStage = (
  taskType: string | undefined,
  stageName: SuiteStageName | null
): StageDescriptor | undefined => {
  if (!stageName) {
    return undefined;
  }
  const task =
    taskType && isKnownTaskType(taskType) ? taskType : DEFAULT_TASK_TYPE;
  return SUITE_PIPELINES[task][stageName];
};
