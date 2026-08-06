import { createParser } from "eventsource-parser";

import { ApiError } from "../errors/api-error";
import type { AuthMode, IdentityMode } from "../types";
import { mergeSignals } from "./http-client";
import { sleep } from "./retry";
import { resolveTokenManager } from "./token-manager";

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
  /** Which credential source to attach for `auth: "required"` — default "authenticated". See docs/runbook/api-client.md §4.5. */
  identity?: IdentityMode;
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

const isAuthRequired = <TEventName extends string>(
  options: SubscribeSseOptions<TEventName>
): boolean => (options.auth ?? "required") === "required";

const buildStreamHeaders = <TEventName extends string>(
  options: SubscribeSseOptions<TEventName>,
  lastEventId: string | null
): Record<string, string> => ({
  Accept: "text/event-stream",
  ...(options.body === undefined ? {} : { "Content-Type": "application/json" }),
  ...options.headers,
  ...(lastEventId ? { "Last-Event-ID": lastEventId } : {}),
});

/** Mutates `headers` in place with a bearer token — throws the token error rather than returning it, matching the rest of `openStream`'s throw-on-failure contract. */
const attachAuthHeader = async <TEventName extends string>(
  headers: Record<string, string>,
  options: SubscribeSseOptions<TEventName>
): Promise<void> => {
  if (!isAuthRequired(options)) {
    return;
  }
  const [tokenError, accessToken] = await resolveTokenManager(
    options.identity
  ).ensureAccessToken();
  if (tokenError) {
    throw tokenError;
  }
  headers.Authorization = `Bearer ${accessToken}`;
};

const isRetryableSseAuthFailure = <TEventName extends string>(
  response: Response,
  options: SubscribeSseOptions<TEventName>,
  hasRetriedAuth: boolean
): boolean =>
  response.status === 401 && isAuthRequired(options) && !hasRetriedAuth;

/**
 * Surfaces the real refresh failure instead of letting the caller see only
 * the original 401 and a generic "SSE connection failed" — same contract as
 * core/interceptors.ts's `attempt()`.
 */
const refreshSseAuth = async <TEventName extends string>(
  options: SubscribeSseOptions<TEventName>
): Promise<void> => {
  const [refreshError] = await resolveTokenManager(options.identity).refresh();
  if (refreshError) {
    throw refreshError;
  }
};

const openStream = <TEventName extends string>(
  url: string,
  options: SubscribeSseOptions<TEventName>,
  signal: AbortSignal,
  lastEventId: string | null
): Promise<Response> => {
  const attempt = async (hasRetriedAuth: boolean): Promise<Response> => {
    const headers = buildStreamHeaders(options, lastEventId);
    await attachAuthHeader(headers, options);

    const response = await fetch(url, {
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      headers,
      method: options.method ?? "GET",
      signal,
    });

    if (!isRetryableSseAuthFailure(response, options, hasRetriedAuth)) {
      return response;
    }

    await refreshSseAuth(options);
    return attempt(true);
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

/** Mutable state threaded through the read-loop helpers below — bundled into one object (rather than several closed-over `let`s) so each helper can be a standalone function instead of a closure nested inside `readStream`. */
interface ReadState {
  shouldStopReading: boolean;
  isReaderCancelled: boolean;
  lastEventId: string | null;
  dispatchError: unknown;
  terminalReached: boolean;
}

const createReadState = (): ReadState => ({
  dispatchError: undefined,
  isReaderCancelled: false,
  lastEventId: null,
  shouldStopReading: false,
  terminalReached: false,
});

/**
 * Fire-and-forget (deliberately not awaited by the caller): some browsers
 * (Safari) never resolve `reader.cancel()`'s promise when cancelling a
 * still-open stream, which is exactly the terminal-event case here (we stop
 * before natural EOF) — awaiting it would hang the caller.
 */
const cancelReader = (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  state: ReadState
): void => {
  state.shouldStopReading = true;
  if (state.isReaderCancelled) {
    return;
  }
  state.isReaderCancelled = true;
  const settleCancel = async () => {
    try {
      await reader.cancel();
    } catch {
      // Connection is torn down by the browser/GC regardless.
    }
  };
  void settleCancel();
};

/** Result of calling `options.onEvent` for one already-filtered frame — kept separate from `handleParserEvent` so a consumer's own throw (a business-logic bug) is never relabeled as `ApiError.network()` by the read loop's catch (which only ever sees genuine `reader.read()`/decode failures). */
const dispatchFrame = <TEventName extends string>(
  eventName: TEventName,
  frame: { id?: string; data: string },
  options: SubscribeSseOptions<TEventName>,
  terminalEventNames: Set<TEventName>
): { dispatchError: unknown; isTerminal: boolean } => {
  try {
    options.onEvent({
      data: frame.data,
      event: eventName,
      id: frame.id ?? null,
    });
  } catch (error) {
    return { dispatchError: error, isTerminal: false };
  }
  return {
    dispatchError: undefined,
    isTerminal: terminalEventNames.has(eventName),
  };
};

const shouldIgnoreParserEvent = <TEventName extends string>(
  event: { event?: string },
  state: ReadState,
  signal: AbortSignal,
  eventNames: Set<TEventName>
): boolean => {
  if (signal.aborted || state.shouldStopReading || !event.event) {
    return true;
  }
  return !eventNames.has(event.event as TEventName);
};

const applyDispatchOutcome = (
  state: ReadState,
  frameError: unknown,
  isTerminal: boolean
): void => {
  if (frameError !== undefined) {
    state.dispatchError = frameError;
    state.shouldStopReading = true;
    return;
  }
  if (isTerminal) {
    state.shouldStopReading = true;
    state.terminalReached = true;
  }
};

/** `eventsource-parser`'s per-frame callback — filters to the frames this subscription cares about, tracks `lastEventId`, and dispatches the rest to the consumer's `onEvent`. */
const handleParserEvent = <TEventName extends string>(
  event: { event?: string; id?: string; data: string },
  state: ReadState,
  signal: AbortSignal,
  options: SubscribeSseOptions<TEventName>,
  eventNames: Set<TEventName>,
  terminalEventNames: Set<TEventName>
): void => {
  if (shouldIgnoreParserEvent(event, state, signal, eventNames)) {
    return;
  }
  const eventName = event.event as TEventName;
  if (event.id) {
    state.lastEventId = event.id;
  }

  const { dispatchError: frameError, isTerminal } = dispatchFrame(
    eventName,
    event,
    options,
    terminalEventNames
  );
  applyDispatchOutcome(state, frameError, isTerminal);
};

/** One `reader.read()` + feed cycle — returns whether the loop below should stop (caller aborted, or natural EOF). */
const readNextChunk = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  parser: ReturnType<typeof createParser>,
  signal: AbortSignal
): Promise<boolean> => {
  if (signal.aborted) {
    return true;
  }
  const { value, done } = await reader.read();
  if (done) {
    return true;
  }
  parser.feed(decoder.decode(value, { stream: true }));
  return false;
};

/** Flushes any bytes `TextDecoder` was still holding onto (a split multi-byte character) once the read loop ends without an explicit stop — only meaningful on a natural EOF, not when `handleParserEvent` already asked the loop to stop. */
const flushRemainingChunk = (
  decoder: TextDecoder,
  parser: ReturnType<typeof createParser>
): void => {
  const remaining = decoder.decode();
  if (remaining) {
    parser.feed(remaining);
  }
};

/** The read loop's body: feed the reader's chunks to the parser until `state.shouldStopReading` (set from inside `handleParserEvent`), the caller aborts, or the stream reaches natural EOF. */
const drainReader = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  parser: ReturnType<typeof createParser>,
  signal: AbortSignal,
  state: ReadState
): Promise<void> => {
  // oxlint-disable-next-line no-unmodified-loop-condition -- `state.shouldStopReading` is set from the parser's `onEvent` callback (invoked synchronously by `parser.feed()` below), not directly in this loop body
  while (!state.shouldStopReading) {
    // Sequential by nature — each read depends on the previous chunk.
    // oxlint-disable-next-line no-await-in-loop
    const isDone = await readNextChunk(reader, decoder, parser, signal);
    if (isDone) {
      break;
    }
  }
  if (state.shouldStopReading) {
    return;
  }
  flushRemainingChunk(decoder, parser);
};

const isAbortError = (error: unknown): boolean =>
  error instanceof DOMException && error.name === "AbortError";

const reportReadError = <TEventName extends string>(
  error: unknown,
  signal: AbortSignal,
  options: SubscribeSseOptions<TEventName>
): void => {
  if (signal.aborted || isAbortError(error)) {
    return;
  }
  options.onError(ApiError.network(error));
};

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
  const state = createReadState();

  const abortReader = () => cancelReader(reader, state);
  signal.addEventListener("abort", abortReader, { once: true });

  const parser = createParser({
    onEvent: (event) =>
      handleParserEvent(
        event,
        state,
        signal,
        options,
        eventNames,
        terminalEventNames
      ),
  });

  try {
    await drainReader(reader, decoder, parser, signal, state);
  } catch (error) {
    reportReadError(error, signal, options);
  } finally {
    signal.removeEventListener("abort", abortReader);
    if (state.shouldStopReading) {
      cancelReader(reader, state);
    }
    try {
      reader.releaseLock();
    } catch {
      // A concurrent cancel() may still be settling — the stream is done either way.
    }
  }

  return {
    dispatchError: state.dispatchError,
    lastEventId: state.lastEventId,
    terminalReached: state.terminalReached,
  };
};

type ConnectOutcome =
  | { kind: "aborted" }
  | { kind: "error"; apiError: ApiError }
  | { kind: "response"; response: Response };

const toApiError = (error: unknown): ApiError =>
  error instanceof ApiError ? error : ApiError.network(error);

const isAbortOutcome = (error: unknown, signal: AbortSignal): boolean =>
  signal.aborted || isAbortError(error);

/** Opens the connection and classifies a thrown failure — a caller-initiated abort (never surfaced as an error) vs. a real open failure (surfaced via the caller's reconnect-or-fail decision). */
const openAndClassifyError = async <TEventName extends string>(
  url: string,
  options: SubscribeSseOptions<TEventName>,
  signal: AbortSignal,
  lastEventId: string | null
): Promise<ConnectOutcome> => {
  try {
    const response = await openStream(url, options, signal, lastEventId);
    return { kind: "response", response };
  } catch (error) {
    if (isAbortOutcome(error, signal)) {
      return { kind: "aborted" };
    }
    return { apiError: toApiError(error), kind: "error" };
  }
};

const isBadSseResponse = (response: Response): boolean =>
  !response.ok || !response.body;

const badSseResponseError = (response: Response): ApiError =>
  new ApiError({
    httpStatus: response.status,
    kind: "network",
    message: "SSE connection failed",
    reason: "ERROR_UNKNOWN",
  });

/**
 * The caller cancelled (or its own `signal` aborted) while the open request
 * was in flight — same "no further callbacks after cancel" rule
 * core/polling.ts's `cancelled` guard enforces, so a superseded subscription
 * (e.g. a React effect that resubscribed to a new process id) can never emit
 * a late callback into now-stale state.
 */
const classifyOpenedResponse = (
  response: Response,
  signal: AbortSignal
): ConnectOutcome => {
  if (signal.aborted) {
    return { kind: "aborted" };
  }
  if (isBadSseResponse(response)) {
    return { apiError: badSseResponseError(response), kind: "error" };
  }
  return { kind: "response", response };
};

/**
 * One connect attempt, classified into "keep going" (`response`), "the
 * caller already cancelled" (`aborted`), or "surface via reconnect-or-fail"
 * (`error`). Split out of `runConnectionCycle` purely to keep that
 * function's cyclomatic complexity down.
 */
const connectAttempt = async <TEventName extends string>(
  url: string,
  options: SubscribeSseOptions<TEventName>,
  signal: AbortSignal,
  lastEventId: string | null
): Promise<ConnectOutcome> => {
  const openResult = await openAndClassifyError(
    url,
    options,
    signal,
    lastEventId
  );
  if (openResult.kind !== "response") {
    return openResult;
  }
  return classifyOpenedResponse(openResult.response, signal);
};

const notifyDone = <TEventName extends string>(
  options: SubscribeSseOptions<TEventName>,
  lastEventId: string | null
): void => {
  options.onDone?.(lastEventId);
};

const resolveNextLastEventId = (
  seenEventId: string | null,
  previousLastEventId: string | null
): string | null => seenEventId || previousLastEventId;

/**
 * What the outer loop should do after one full read (terminal event, fatal
 * dispatch error, caller cancelled, or an unexpected mid-read close) — split
 * out of `runConnectionCycle` purely to keep that function's cyclomatic
 * complexity down.
 */
const decideAfterRead = async <TEventName extends string>(
  readResult: ReadStreamResult,
  previousLastEventId: string | null,
  attempt: number,
  signal: AbortSignal,
  options: SubscribeSseOptions<TEventName>,
  reconnectOrFail: (apiError: ApiError, attempt: number) => Promise<boolean>
): Promise<{ done: boolean; lastEventId: string | null }> => {
  const {
    lastEventId: seenEventId,
    dispatchError,
    terminalReached,
  } = readResult;
  const nextLastEventId = resolveNextLastEventId(
    seenEventId,
    previousLastEventId
  );

  if (signal.aborted) {
    return { done: true, lastEventId: nextLastEventId };
  }
  if (dispatchError !== undefined) {
    options.onError(ApiError.handlerFailure(dispatchError));
    return { done: true, lastEventId: nextLastEventId };
  }
  if (terminalReached) {
    notifyDone(options, nextLastEventId);
    return { done: true, lastEventId: nextLastEventId };
  }

  // Stream closed mid-read without a terminal event — an unexpected
  // disconnect (network blip, proxy/load-balancer idle timeout), not
  // completion; the backend job itself keeps running regardless (see
  // docs/runbook/api-client.md §10), so reconnect from `lastEventId`
  // instead of surfacing this as a fatal error.
  const unexpectedCloseError = ApiError.network(
    new Error("SSE stream closed unexpectedly")
  );
  const shouldReconnect = await reconnectOrFail(unexpectedCloseError, attempt);
  return { done: !shouldReconnect, lastEventId: nextLastEventId };
};

/**
 * One connect-and-read cycle: open the connection, read frames until the
 * stream ends, and decide what the outer loop should do next. Pulled out of
 * `subscribeSse`'s reconnect loop so each disconnect reason (open failure,
 * bad response, unexpected mid-read close) is handled once per call instead
 * of the loop repeating the same try/reconnect shape three times.
 */
const runConnectionCycle = async <TEventName extends string>(
  url: string,
  options: SubscribeSseOptions<TEventName>,
  signal: AbortSignal,
  eventNames: Set<TEventName>,
  terminalEventNames: Set<TEventName>,
  reconnectOrFail: (apiError: ApiError, attempt: number) => Promise<boolean>,
  lastEventId: string | null,
  attempt: number
): Promise<{ done: boolean; lastEventId: string | null }> => {
  const connectResult = await connectAttempt(url, options, signal, lastEventId);

  if (connectResult.kind === "aborted") {
    return { done: true, lastEventId };
  }
  if (connectResult.kind === "error") {
    const shouldReconnect = await reconnectOrFail(
      connectResult.apiError,
      attempt
    );
    return { done: !shouldReconnect, lastEventId };
  }

  const readResult = await readStream(
    connectResult.response,
    options,
    signal,
    eventNames,
    terminalEventNames
  );
  return decideAfterRead(
    readResult,
    lastEventId,
    attempt,
    signal,
    options,
    reconnectOrFail
  );
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
      // oxlint-disable-next-line no-await-in-loop -- each reconnect attempt depends on the previous one's outcome
      const { done, lastEventId: cycleLastEventId } = await runConnectionCycle(
        url,
        options,
        signal,
        eventNames,
        terminalEventNames,
        reconnectOrFail,
        lastEventId,
        attempt
      );
      lastEventId = cycleLastEventId;
      if (done) {
        return;
      }
      attempt += 1;
    }
  })();

  return { cancel: () => controller.abort() };
};
