import { SUITE_CREATIVE_STAGE_STATUS } from "@/features/suite/utils/constants/design-studio-stream";
import type {
  SUITE_CREATIVE_STREAM_STAGE,
  SuiteStageStatus,
} from "@/features/suite/utils/constants/design-studio-stream";

export type SuiteStageName =
  (typeof SUITE_CREATIVE_STREAM_STAGE)[keyof typeof SUITE_CREATIVE_STREAM_STAGE];
export type { SuiteStageStatus } from "@/features/suite/utils/constants/design-studio-stream";

/** Normalized stage info pulled out of any SSE payload, regardless of event type. */
export interface SuiteStageInfo {
  stageName: SuiteStageName | null;
  stageStatus: SuiteStageStatus | null;
  /** stage.message — used as the loading label for thinking/guideline/generating. */
  message: string | null;
}

interface RawStage {
  name?: unknown;
  status?: unknown;
  message?: unknown;
}

const hasStage = (payload: unknown): payload is { stage?: RawStage } =>
  typeof payload === "object" && payload !== null && "stage" in payload;

/**
 * Extracts `stage.name` / `stage.status` / `stage.message` from a payload in one place, so the
 * coordinator can switch on the real protocol fields (event + stage.name + stage.status) without
 * each handler re-digging into the payload shape.
 */
export const parseStageInfo = (payload: unknown): SuiteStageInfo => {
  if (!hasStage(payload) || !payload.stage) {
    return { message: null, stageName: null, stageStatus: null };
  }

  const { stage } = payload;
  const stageName =
    typeof stage.name === "string" && stage.name
      ? (stage.name as SuiteStageName)
      : null;
  const stageStatus =
    stage.status === SUITE_CREATIVE_STAGE_STATUS.IN_PROGRESS ||
    stage.status === SUITE_CREATIVE_STAGE_STATUS.COMPLETE ||
    stage.status === SUITE_CREATIVE_STAGE_STATUS.ERROR
      ? (stage.status as SuiteStageStatus)
      : null;
  const message =
    typeof stage.message === "string" && stage.message ? stage.message : null;

  return { message, stageName, stageStatus };
};
