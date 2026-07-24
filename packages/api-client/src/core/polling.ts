import type { ApiError, ApiResult } from "../errors/api-error";
import type { ProcessStatus } from "../types";

export interface ProcessSnapshot<T> {
  status: ProcessStatus;
  data?: T;
}

export interface ProcessPoller<T> {
  fetchStatus: (signal: AbortSignal) => Promise<ApiResult<ProcessSnapshot<T>>>;
  intervalMs?: number;
}

export interface ProcessCallbacks<T> {
  onUpdate: (snapshot: ProcessSnapshot<T>) => void;
  onError: (error: ApiError) => void;
}

const DEFAULT_POLL_INTERVAL_MS = 1000;

const isOffline = (): boolean =>
  typeof navigator !== "undefined" && navigator.onLine === false;

/**
 * `temp/` confirms chat/deep-research/image-gen have no real SSE today —
 * they issue a `process_id` and the client polls (see §2/§10). Returns a
 * cancel function; polling stops on cancel, on a terminal status, or if the
 * fetch itself was aborted.
 *
 * Pauses instead of erroring while offline (a raw `setTimeout` loop, unlike
 * TanStack Query's queries/mutations, has no built-in `onlineManager` pause —
 * see docs/runbook/api-client.md §7) and resumes immediately on the
 * `online` event rather than waiting out the rest of the current interval.
 */
export const pollProcess = <T>(
  poller: ProcessPoller<T>,
  callbacks: ProcessCallbacks<T>
): (() => void) => {
  let cancelled = false;
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const tick = async (): Promise<void> => {
    if (cancelled) {
      return;
    }
    // Skip the network call entirely while offline; `handleOnline` below
    // resumes the poll as soon as connectivity returns instead of leaving it
    // dead until the next scheduled interval (there is none — no timer is
    // set here on purpose).
    if (isOffline()) {
      return;
    }

    const [error, snapshot] = await poller.fetchStatus(controller.signal);
    if (cancelled) {
      return;
    }
    if (error) {
      // Connectivity dropped mid-request rather than before it — same
      // "wait for `online`" behavior as the isOffline() guard above, not a
      // user-facing error.
      if (error.kind === "network" && isOffline()) {
        return;
      }
      if (error.kind === "aborted") {
        return;
      }
      // This one tick already exhausted authenticatedRequest's own backoff
      // retries (core/retry.ts) — but the underlying long-running job (chat,
      // image gen, deep research) can easily outlive a single transient
      // blip, so a still-retryable error shouldn't end the whole polling
      // session. Keep polling on the normal interval; only a non-retryable
      // error (auth, validation, permanent failure) is reported and stops it.
      if (error.isRetryable) {
        timer = setTimeout(
          () => void tick(),
          poller.intervalMs ?? DEFAULT_POLL_INTERVAL_MS
        );
        return;
      }
      callbacks.onError(error);
      return;
    }

    callbacks.onUpdate(snapshot);
    if (snapshot.status === "pending") {
      timer = setTimeout(
        () => void tick(),
        poller.intervalMs ?? DEFAULT_POLL_INTERVAL_MS
      );
    }
  };

  const handleOnline = (): void => {
    if (cancelled) {
      return;
    }
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    void tick();
  };

  if (typeof window !== "undefined") {
    window.addEventListener("online", handleOnline);
  }

  void tick();

  return () => {
    cancelled = true;
    if (timer) {
      clearTimeout(timer);
    }
    controller.abort();
    if (typeof window !== "undefined") {
      window.removeEventListener("online", handleOnline);
    }
  };
};
