export const SUITE_CREATIVE_STREAM_EVENT = {
  AI_ERROR: "ai.error",
  ANALYSIS_READY: "analysis.ready",
  GENERATING: "generating",
  MESSAGE_DONE: "message.done",
  MESSAGE_ERROR: "message.error",
  MESSAGE_SUMMARY: "message.summary",
  OUTPUT_READY: "output.ready",
  PLAN_READY: "plan.ready",
  STREAM_ERROR: "stream.error",
} as const;

// message.error is intentionally NOT terminal: only a `system`-stage message.error is fatal, and
// BE keeps sending events after a non-fatal one — so the reader must keep reading. The fatal case is
// handled in the coordinator (renderError) and the stream still ends on message.done / connection close.
export const SUITE_CREATIVE_STREAM_TERMINAL_EVENTS = [
  SUITE_CREATIVE_STREAM_EVENT.MESSAGE_DONE,
  SUITE_CREATIVE_STREAM_EVENT.STREAM_ERROR,
  SUITE_CREATIVE_STREAM_EVENT.AI_ERROR,
] as const;

export const SUITE_CREATIVE_STREAM_STAGE = {
  STARTED: "started",
  ANALYZE_LOGO_REQUEST: "analyze_logo_request",
  GENERATE_DESIGN_GUIDELINE: "generate_design_guideline",
  GENERATE_LOGO: "generate_logo",
  GENERATE_IMAGE: "generate_image",
  EDIT_LOGO: "edit_logo",
  CHAT: "chat",
  // A message.error carrying this stage is FATAL → switch to the error card. A message.error on any
  // other stage is non-fatal: BE keeps streaming afterwards, so the UI must keep rendering.
  SYSTEM: "system",
} as const;

// stage.status values as sent by BE
export const SUITE_CREATIVE_STAGE_STATUS = {
  COMPLETE: "complete",
  ERROR: "error",
  IN_PROGRESS: "in-progress",
} as const;

// task_type values — extend here when adding new generation tools (video, etc.)
export const SUITE_CREATIVE_TASK_TYPE = {
  LOGO_DESIGN: "logo_design",
} as const;

// UI block kinds the animation queue can render. Generated media is split per type
// (image/video/…) so each gets its own builder + component — never gathered into one.
export const SUITE_BLOCK_KIND = {
  BOT: "bot",
  GENERATED_IMAGE: "generated-image",
  GENERATING: "generating",
  GUIDELINE: "guideline",
  THINKING: "thinking",
} as const;

export type SuiteStageStatus =
  (typeof SUITE_CREATIVE_STAGE_STATUS)[keyof typeof SUITE_CREATIVE_STAGE_STATUS];
export type SuiteTaskType =
  (typeof SUITE_CREATIVE_TASK_TYPE)[keyof typeof SUITE_CREATIVE_TASK_TYPE];
export type SuiteBlockKind =
  (typeof SUITE_BLOCK_KIND)[keyof typeof SUITE_BLOCK_KIND];
