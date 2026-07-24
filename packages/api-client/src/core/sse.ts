import { createParser } from "eventsource-parser";

import { ApiError } from "../errors/api-error";
import type { AuthMode } from "../types";
import { mergeSignals } from "./http-client";
import { sleep } from "./retry";
import { getTokenManager } from "./token-manager";

const RECONNECT_BASE_DELAY_MS = 1000;
const RECONNECT_MAX_DELAY_MS = 15_000;

const reconnectDelayMs = (attempt: number): number =>
  Math.min(RECONNECT_BASE_DELAY_MS * 2 ** attempt, RECONNECT_MAX_DELAY_MS);

const isOffline = (): boolean =>
  typeof navigator !== "undefined" && navigator.onLine === false;

/** Resolves immediately if already online; otherwise waits for the `online` event (or an abort, whichever comes first) — same pause/resume contract as core/polling.ts's `isOffline()` guard. */
const waitForOnline = (signal: AbortSignal): Promise<void> => {
  if (!isOffline() || typeof window === "undefined") {
    return Promise.resolve();
  }
  // oxlint-disable-next-line promise/avoid-new -- no promise-returning equivalent for "wait for a DOM event or abort"
  return new Promise((resolve) => {
    const settle = () => {
      window.removeEventListener("online", settle);
      signal.removeEventListener("abort", settle);
      resolve();
    };
    window.addEventListener("online", settle, { once: true });
    signal.addEventListener("abort", settle, { once: true });
  });
};

/**
 * A real backend SSE stream (confirmed against
 * apps/super-app/src/features/suite/services/design-studio/stream-reader.ts)
 * uses named `event:` frames, not a bare `data: ...\n\n`/`[DONE]` convention —
 * this wraps `eventsource-parser` (spec-compliant: multi-line `data:`,
 * comments, `retry:`, partial-chunk handling) instead of hand-splitting text.
 */
export interface SseEvent<TEventName extends string> {
  id: string | null;
  event: TEventName;
  data: string;
}

export interface SubscribeSseOptions<TEventName extends string> {
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: unknown;
  signal?: AbortSignal;
  /** Default "required" — attaches `Authorization` and does a refresh-and-retry-once on an initial 401, same contract as core/interceptors.ts. */
  auth?: AuthMode;
  /** Resume cursor from a previous subscription's `onDone(lastEventId)` — sent as the standard `Last-Event-ID` header. */
  lastEventId?: string | null;
  /** Only frames whose `event:` name is one of these are dispatched — anything else (including unnamed/comment frames) is ignored. */
  eventNames: readonly TEventName[];
  /**
   * Any of these event names ends the read loop immediately — the reader is
   * cancelled (fire-and-forget, never awaited: some browsers never resolve
   * `reader.cancel()` when the stream is still open) rather than waiting for
   * the connection to close naturally.
   */
  terminalEventNames?: readonly TEventName[];
  /**
   * Auto-reconnect (fresh `fetch`, resuming from the last-seen `Last-Event-ID`)
   * when the stream drops mid-read without a terminal event — a network blip,
   * proxy/load-balancer idle timeout, or the machine going offline, none of
   * which the backend job itself is aware of (it keeps running regardless,
   * see docs/runbook/api-client.md §10). Pauses while offline and resumes on
   * the `online` event, backing off between attempts otherwise — same
   * philosophy as core/polling.ts. Default `true`; set `false` to surface
   * the drop as `onError` instead (e.g. a caller that wants to own retry UI).
   */
  reconnect?: boolean;
  onEvent: (event: SseEvent<TEventName>) => void;
  onError: (error: ApiError) => void;
  /** `lastEventId` is the last frame id seen, for a caller-initiated resume via `lastEventId` above. */
  onDone?: (lastEventId: string | null) => void;
}

export interface SseSubscription {
  cancel: () => void;
}

const openStream = <TEventName extends string>(
  url: string,
  options: SubscribeSseOptions<TEventName>,
  signal: AbortSignal,
  lastEventId: string | null
): Promise<Response> => {
  const attempt = async (hasRetriedAuth: boolean): Promise<Response> => {
    const headers: Record<string, string> = {
      Accept: "text/event-stream",
      ...(options.body === undefined
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
      ...(lastEventId ? { "Last-Event-ID": lastEventId } : {}),
    };

    if ((options.auth ?? "required") === "required") {
      const [tokenError, accessToken] =
        await getTokenManager().ensureAccessToken();
      if (tokenError) {
        throw tokenError;
      }
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      headers,
      method: options.method ?? "GET",
      signal,
    });

    if (
      response.status === 401 &&
      (options.auth ?? "required") === "required" &&
      !hasRetriedAuth
    ) {
      const [refreshError] = await getTokenManager().refresh();
      if (refreshError) {
        // Surface the real refresh failure instead of letting the caller
        // see only the original 401 and a generic "SSE connection failed" —
        // same contract as core/interceptors.ts's `attempt()`.
        throw refreshError;
      }
      return attempt(true);
    }

    return response;
  };

  return attempt(false);
};

interface ReadStreamResult {
  lastEventId: string | null;
  /** A consumer's `onEvent` throwing — a business-logic bug, not a stream I/O failure (see below). */
  dispatchError: unknown;
  /** True only when a name in `terminalEventNames` actually fired — a natural EOF/network drop WITHOUT one is treated as an unexpected disconnect (see `subscribeSse`'s reconnect loop), not a completed stream. */
  terminalReached: boolean;
}

/**
 * Drains `response.body` through `eventsource-parser`, dispatching every
 * frame whose `event:` name is in `eventNames` to `options.onEvent`, until a
 * terminal event, the caller cancels (`signal` aborts), or the stream
 * closes/errors. Split out of `subscribeSse` purely to keep that function's
 * cyclomatic complexity down — this is the read-loop half, `subscribeSse`
 * itself only handles connect/auth-retry and the done/error callback.
 */
const readStream = async <TEventName extends string>(
  response: Response,
  options: SubscribeSseOptions<TEventName>,
  signal: AbortSignal,
  eventNames: Set<TEventName>,
  terminalEventNames: Set<TEventName>
): Promise<ReadStreamResult> => {
  // Callers already check `response.body` before calling this.
  const reader = (response.body as ReadableStream<Uint8Array>).getReader();
  const decoder = new TextDecoder();
  let shouldStopReading = false;
  let isReaderCancelled = false;
  let lastEventId: string | null = null;
  let dispatchError: unknown;
  let terminalReached = false;

  const cancelReader = () => {
    shouldStopReading = true;
    if (isReaderCancelled) {
      return;
    }
    isReaderCancelled = true;
    // Fire-and-forget (deliberately not awaited by the caller): some
    // browsers (Safari) never resolve this promise when cancelling a
    // still-open stream, which is exactly the terminal-event case here (we
    // stop before natural EOF) — awaiting it would hang the caller.
    const settleCancel = async () => {
      try {
        await reader.cancel();
      } catch {
        // Connection is torn down by the browser/GC regardless.
      }
    };
    void settleCancel();
  };

  const abortReader = () => cancelReader();
  signal.addEventListener("abort", abortReader, { once: true });

  const parser = createParser({
    onEvent: (event) => {
      if (signal.aborted || shouldStopReading || !event.event) {
        return;
      }
      const eventName = event.event as TEventName;
      if (!eventNames.has(eventName)) {
        return;
      }
      if (event.id) {
        lastEventId = event.id;
      }
      try {
        options.onEvent({
          data: event.data,
          event: eventName,
          id: event.id ?? null,
        });
      } catch (error) {
        // Captured separately so it doesn't get relabeled as
        // `ApiError.network()` by the catch below (which only ever sees
        // genuine `reader.read()`/decode failures).
        dispatchError = error;
        shouldStopReading = true;
        return;
      }
      if (terminalEventNames.has(eventName)) {
        shouldStopReading = true;
        terminalReached = true;
      }
    },
  });

  try {
    // oxlint-disable-next-line no-unmodified-loop-condition -- `shouldStopReading` is set from the parser's `onEvent` callback (invoked synchronously by `parser.feed()` below), not directly in this loop body
    while (!shouldStopReading) {
      if (signal.aborted) {
        break;
      }
      // Sequential by nature — each read depends on the previous chunk.
      // oxlint-disable-next-line no-await-in-loop
      const { value, done } = await reader.read();
      if (done) {
        break;
      }
      parser.feed(decoder.decode(value, { stream: true }));
    }
    if (!shouldStopReading) {
      const remaining = decoder.decode();
      if (remaining) {
        parser.feed(remaining);
      }
    }
  } catch (error) {
    if (
      !signal.aborted &&
      !(error instanceof DOMException && error.name === "AbortError")
    ) {
      options.onError(ApiError.network(error));
    }
  } finally {
    signal.removeEventListener("abort", abortReader);
    if (shouldStopReading) {
      cancelReader();
    }
    try {
      reader.releaseLock();
    } catch {
      // A concurrent cancel() may still be settling — the stream is done either way.
    }
  }

  return { dispatchError, lastEventId, terminalReached };
};

/**
 * Subscribe to a named-event SSE stream. Fire-and-forget: returns
 * immediately with a `cancel()` handle, callbacks fire as frames arrive.
 *
 * Auto-reconnects (see `reconnect` option) on any disconnect that isn't an
 * explicit terminal event — offline-aware and backing off between attempts,
 * mirroring core/polling.ts's pause/resume — instead of a single connect
 * attempt that surfaces every mid-stream network blip as a fatal `onError`.
 */
export const subscribeSse = <TEventName extends string>(
  url: string,
  options: SubscribeSseOptions<TEventName>
): SseSubscription => {
  const controller = new AbortController();
  const signal =
    mergeSignals(options.signal, controller.signal) ?? controller.signal;
  const eventNames = new Set<TEventName>(options.eventNames);
  const terminalEventNames = new Set<TEventName>(options.terminalEventNames);
  const reconnectEnabled = options.reconnect ?? true;

  const scheduleReconnect = async (attempt: number): Promise<void> => {
    await waitForOnline(signal);
    if (signal.aborted) {
      return;
    }
    await sleep(reconnectDelayMs(attempt));
  };

  /**
   * Centralizes the "surface a fatal error vs. wait-and-reconnect" decision
   * so the main loop below doesn't repeat this branch 3 times (open-stream
   * failure, bad response, unexpected mid-read close) — that repetition is
   * exactly what pushed the loop over the function-complexity budget.
   * Returns whether the caller should `continue` the loop (reconnect).
   */
  const reconnectOrFail = async (
    apiError: ApiError,
    attempt: number
  ): Promise<boolean> => {
    if (!reconnectEnabled || !apiError.isRetryable) {
      options.onError(apiError);
      return false;
    }
    await scheduleReconnect(attempt);
    return true;
  };

  (async () => {
    let lastEventId = options.lastEventId ?? null;
    let attempt = 0;

    // oxlint-disable-next-line no-unmodified-loop-condition -- `signal` aborts asynchronously (cancel()/the caller's own signal), checked at the top of every iteration
    while (!signal.aborted) {
      let response: Response;
      try {
        // oxlint-disable-next-line no-await-in-loop -- each reconnect attempt depends on the previous one's outcome
        response = await openStream(url, options, signal, lastEventId);
      } catch (error) {
        if (
          signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }
        const apiError =
          error instanceof ApiError ? error : ApiError.network(error);
        // oxlint-disable-next-line no-await-in-loop
        if (!(await reconnectOrFail(apiError, attempt))) {
          return;
        }
        attempt += 1;
        continue;
      }

      // The caller cancelled (or its own `signal` aborted) while the request
      // above was in flight — same "no further callbacks after cancel" rule
      // core/polling.ts's `cancelled` guard enforces, so a superseded
      // subscription (e.g. a React effect that resubscribed to a new process
      // id) can never emit a late callback into now-stale state.
      if (signal.aborted) {
        return;
      }

      if (!response.ok || !response.body) {
        const apiError = new ApiError({
          httpStatus: response.status,
          kind: "network",
          message: "SSE connection failed",
          reason: "ERROR_UNKNOWN",
        });
        // oxlint-disable-next-line no-await-in-loop
        if (!(await reconnectOrFail(apiError, attempt))) {
          return;
        }
        attempt += 1;
        continue;
      }

      // oxlint-disable-next-line no-await-in-loop
      const readResult = await readStream(
        response,
        options,
        signal,
        eventNames,
        terminalEventNames
      );
      const {
        lastEventId: seenEventId,
        dispatchError,
        terminalReached,
      } = readResult;
      if (seenEventId) {
        lastEventId = seenEventId;
      }

      if (signal.aborted) {
        return;
      }
      if (dispatchError !== undefined) {
        options.onError(ApiError.handlerFailure(dispatchError));
        return;
      }
      if (terminalReached) {
        options.onDone?.(lastEventId);
        return;
      }

      // Stream closed mid-read without a terminal event — an unexpected
      // disconnect (network blip, proxy/load-balancer idle timeout), not
      // completion; the backend job itself keeps running regardless (see
      // docs/runbook/api-client.md §10), so reconnect from `lastEventId`
      // instead of surfacing this as a fatal error.
      const unexpectedCloseError = ApiError.network(
        new Error("SSE stream closed unexpectedly")
      );
      // oxlint-disable-next-line no-await-in-loop
      const reconnected = await reconnectOrFail(unexpectedCloseError, attempt);
      if (!reconnected) {
        return;
      }
      attempt += 1;
    }
  })();

  return { cancel: () => controller.abort() };
};
