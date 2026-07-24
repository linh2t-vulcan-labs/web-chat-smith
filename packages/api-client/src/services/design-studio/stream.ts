import type { SseSubscription } from "../../core/sse";
import { subscribeSse } from "../../core/sse";
import { buildUrl } from "../../utils/build-url";
import { resolveBaseUrl } from "../../utils/runtime-env";
import { DESIGN_STUDIO_PATH_PREFIX, DESIGN_STUDIO_SERVICE } from "./constants";

/**
 * Message generation SSE stream — confirmed against
 * apps/super-app/src/features/suite/services/design-studio/stream-reader.ts
 * and utils/constants/design-studio-stream.ts. Not part of the
 * `defineService()` chain in `./index.ts` since its response isn't JSON.
 */
export const DESIGN_STUDIO_STREAM_EVENT = {
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

export type DesignStudioStreamEventName =
  (typeof DESIGN_STUDIO_STREAM_EVENT)[keyof typeof DESIGN_STUDIO_STREAM_EVENT];

const DESIGN_STUDIO_STREAM_EVENT_NAMES = Object.values(
  DESIGN_STUDIO_STREAM_EVENT
) as DesignStudioStreamEventName[];

// `message.error` is deliberately NOT here: it's only fatal when its
// `stage.name === "system"` — any other stage's `message.error` is non-fatal
// and the backend keeps streaming, so that distinction is a caller/UI-layer
// concern (inspect the parsed payload's `stage.name`), not a transport one.
export const DESIGN_STUDIO_STREAM_TERMINAL_EVENTS: DesignStudioStreamEventName[] =
  [
    DESIGN_STUDIO_STREAM_EVENT.MESSAGE_DONE,
    DESIGN_STUDIO_STREAM_EVENT.STREAM_ERROR,
    DESIGN_STUDIO_STREAM_EVENT.AI_ERROR,
  ];

export interface OpenMessageStreamInput {
  projectId: string;
  messageId: string;
  /** Resume cursor from a previous stream's `onDone(lastEventId)` — sent as `Last-Event-ID`. */
  lastEventId?: string | null;
  signal?: AbortSignal;
}

export type OpenMessageStreamHandlers = Pick<
  Parameters<typeof subscribeSse<DesignStudioStreamEventName>>[1],
  "onEvent" | "onError" | "onDone"
>;

/**
 * Opens the SSE feed for one generation turn: `POST .../messages` (see
 * `postMessageConfig` in `./messages.ts`) first to get a `messageId`, then
 * this to stream its progress. GET, no body — matches
 * apps/super-app/src/features/suite/services/design-studio/stream-service.ts.
 */
export const openMessageStream = (
  input: OpenMessageStreamInput,
  handlers: OpenMessageStreamHandlers
): SseSubscription =>
  subscribeSse<DesignStudioStreamEventName>(
    buildUrl({
      baseUrl: resolveBaseUrl(),
      path: `/projects/${input.projectId}/messages/${input.messageId}/stream`,
      pathPrefix: DESIGN_STUDIO_PATH_PREFIX,
      service: DESIGN_STUDIO_SERVICE,
    }),
    {
      eventNames: DESIGN_STUDIO_STREAM_EVENT_NAMES,
      lastEventId: input.lastEventId,
      signal: input.signal,
      terminalEventNames: DESIGN_STUDIO_STREAM_TERMINAL_EVENTS,
      ...handlers,
    }
  );

export type { SseEvent } from "../../core/sse";
