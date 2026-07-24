import { createParser } from "eventsource-parser";
import type { EventSourceMessage } from "eventsource-parser";

import type {
  SSEHandlers,
  TSuiteCreativeSSEPayloadMap,
  TSuiteCreativeStreamEventName,
} from "@/features/suite/types/design-studio";
import {
  SUITE_CREATIVE_STREAM_EVENT,
  SUITE_CREATIVE_STREAM_TERMINAL_EVENTS,
} from "@/features/suite/utils/constants/design-studio-stream";

export type {
  SSEHandlers,
  TSuiteCreativeSSEHandlers,
} from "@/features/suite/types/design-studio";

const STREAM_EVENT_NAMES = new Set<TSuiteCreativeStreamEventName>(
  Object.values(SUITE_CREATIVE_STREAM_EVENT)
);

const TERMINAL_EVENTS = new Set<TSuiteCreativeStreamEventName>(
  SUITE_CREATIVE_STREAM_TERMINAL_EVENTS
);

function isSuiteCreativeSSEEventName(
  eventName: string
): eventName is TSuiteCreativeStreamEventName {
  return STREAM_EVENT_NAMES.has(eventName as TSuiteCreativeStreamEventName);
}

function parseSSEPayload<TEventName extends TSuiteCreativeStreamEventName>(
  event: EventSourceMessage & { event: TEventName }
): TSuiteCreativeSSEPayloadMap[TEventName] {
  try {
    return JSON.parse(event.data) as TSuiteCreativeSSEPayloadMap[TEventName];
  } catch {
    // Some events send a bare text body, not JSON (e.g. stream.error / ai.error → "generation
    // failed"). Return an empty payload instead of throwing so the event still dispatches — the
    // error handlers ignore the payload and just render the error card (+ toast). JSON events are
    // unaffected; a malformed JSON event surfaces via the dispatch try/catch as before.
    return undefined as unknown as TSuiteCreativeSSEPayloadMap[TEventName];
  }
}

function dispatchSuiteCreativeSSEEvent<
  TEventName extends TSuiteCreativeStreamEventName,
>(
  eventName: TEventName,
  payload: TSuiteCreativeSSEPayloadMap[TEventName],
  event: EventSourceMessage,
  handlers: Partial<SSEHandlers>
): void {
  const handler = handlers[eventName] as
    | ((
        payload: TSuiteCreativeSSEPayloadMap[TEventName],
        event: EventSourceMessage
      ) => void)
    | undefined;

  handler?.(payload, event);
}

export interface ReadSuiteCreativeStreamResult {
  lastEventId: string | null;
}

export async function readSuiteCreativeStream(
  response: Response,
  handlers: Partial<SSEHandlers>,
  signal?: AbortSignal
): Promise<ReadSuiteCreativeStreamResult> {
  if (!response.body) {
    throw new Error("Creative Studio stream response body is empty.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let shouldStopReading = false;
  let isReaderCanceled = false;
  let lastEventId: string | null = null;
  let dispatchError: unknown = null;

  const cancelReader = () => {
    shouldStopReading = true;

    if (!isReaderCanceled) {
      isReaderCanceled = true;
      // Safari bug: reader.cancel()'s promise never resolves when the reader is cancelled while the
      // stream is still open — which is exactly our case, because we stop on the terminal SSE event
      // (message.done) before the body reaches natural EOF. Awaiting it would block this function
      // from returning, leaving the stream mutation stuck "pending" and the composer locked. So we
      // fire-and-forget: signal cancellation but never wait on it (the connection is torn down by the
      // browser/GC regardless).
      reader.cancel().catch((error) => {
        console.warn("[SuiteCreativeStream] reader.cancel() rejected:", error);
      });
    }
  };

  const abortReader = () => {
    void cancelReader();
  };

  signal?.addEventListener("abort", abortReader, { once: true });

  const parser = createParser({
    onEvent: (event) => {
      if (shouldStopReading) {
        return;
      }

      if (!event.event || !isSuiteCreativeSSEEventName(event.event)) {
        return;
      }

      if (event.id) {
        lastEventId = event.id;
      }

      const payload = parseSSEPayload(
        event as EventSourceMessage & { event: typeof event.event }
      );

      try {
        dispatchSuiteCreativeSSEEvent(event.event, payload, event, handlers);
      } catch (error) {
        dispatchError = error;
        shouldStopReading = true;
        return;
      }

      if (TERMINAL_EVENTS.has(event.event)) {
        shouldStopReading = true;
      }
    },
  });

  try {
    while (!shouldStopReading) {
      if (signal?.aborted) {
        shouldStopReading = true;
        break;
      }

      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      parser.feed(decoder.decode(value, { stream: true }));
    }

    const remainingText = shouldStopReading ? "" : decoder.decode();

    if (remainingText) {
      parser.feed(remainingText);
    }

    if (shouldStopReading) {
      cancelReader();
    }
  } finally {
    signal?.removeEventListener("abort", abortReader);
    // releaseLock can throw if a cancel initiated just above is still settling; the stream is done
    // with either way, so ignore.
    try {
      reader.releaseLock();
    } catch (error) {
      // no-op
      console.warn(
        "[SuiteCreativeStream] releaseLock() failed (cancel likely still settling):",
        error
      );
    }
  }

  if (dispatchError !== null) {
    throw dispatchError instanceof Error
      ? dispatchError
      : new Error(String(dispatchError));
  }

  return { lastEventId };
}
