"use client";

import { useEffect, useRef, useState } from "react";

import { pollProcess } from "../core/polling";
import {
  clearPendingProcess,
  savePendingProcess,
} from "../core/process-storage";
import { subscribeSse } from "../core/sse";
import type { ApiError, ApiResult } from "../errors/api-error";
import type { ProcessStatus, ProcessTransport } from "../types";

export interface UseProcessOptions<T> {
  transport: ProcessTransport;
  pollIntervalMs?: number;
  /** Required when transport is "poll" — call the domain's own `.../processes/{id}` or `.../tracing` endpoint. */
  fetchStatus?: (
    processId: string,
    signal: AbortSignal
  ) => Promise<ApiResult<{ status: ProcessStatus; data?: T }>>;
  /** Required when transport is "sse" — the backend's real SSE frames are named (`event: ...`), see core/sse.ts. */
  sseUrl?: (processId: string) => string;
  /** Required when transport is "sse" — every `event:` name this stream can send. */
  sseEventNames?: string[];
  /** Which of `sseEventNames` end the subscription (default: none — only stream-close/error end it). */
  sseTerminalEventNames?: string[];
  sseHeaders?: Record<string, string>;
  enabled?: boolean;
  /**
   * Caller-scoped key (e.g. `conversation:${conversationId}`) to persist
   * this `processId` to `localStorage` while it's pending — the backend job
   * itself keeps running regardless of the client (§10), but without this
   * the page has no way to know which job to resume after a reload/reopened
   * tab, since `processId` only lives in React state. Read the persisted
   * value back with `loadPendingProcess()` (`@cs/api-client/core/process-storage`)
   * on mount to decide which `processId` to pass in. Omit to opt out.
   */
  persistKey?: string;
}

export interface UseProcessResult<T> {
  data: T | undefined;
  status: ProcessStatus;
  error: ApiError | null;
  cancel: () => void;
}

// oxlint-disable-next-line no-empty-function -- placeholder cancel before a real poll/SSE subscription exists
const noopCancel = () => {};

/**
 * One interface for every long-running operation (chat, image gen, deep
 * research) regardless of whether the backend exposes it as poll or SSE —
 * flipping `transport` in the endpoint config is the only change needed
 * when a domain gets real SSE later (see docs/runbook/api-client.md §10).
 */
export const useProcess = <T>(
  processId: string | undefined,
  options: UseProcessOptions<T>
): UseProcessResult<T> => {
  const [data, setData] = useState<T | undefined>();
  const [status, setStatus] = useState<ProcessStatus>("pending");
  const [error, setError] = useState<ApiError | null>(null);
  const cancelRef = useRef<() => void>(noopCancel);

  useEffect(() => {
    if (!processId || options.enabled === false) {
      return;
    }

    // Reset (not a derived value) whenever we start tracking a different
    // process id — resubscribing below is exactly "subscribe to an external
    // system" per React's effect guidance, so this reset belongs here too.
    // oxlint-disable-next-line react/react-compiler -- reset-on-id-change before resubscribing is intentional, not a derivable render value
    setStatus("pending");
    setError(null);
    setData(undefined);

    const { persistKey } = options;
    if (persistKey) {
      savePendingProcess(persistKey, {
        processId,
        startedAt: Date.now(),
        transport: options.transport,
      });
    }
    // The backend job keeps running regardless of the client (§10) — only
    // clear the persisted entry once we know it actually reached a terminal
    // state, never on unmount/resubscribe (see the effect cleanup below),
    // otherwise a page navigated away from mid-job would lose the ability
    // to resume watching it after coming back.
    const clearPersisted = () => {
      if (persistKey) {
        clearPendingProcess(persistKey);
      }
    };

    if (options.transport === "poll") {
      const { fetchStatus } = options;
      if (!fetchStatus) {
        throw new Error(
          'useProcess: `fetchStatus` is required when transport is "poll"'
        );
      }
      cancelRef.current = pollProcess(
        {
          fetchStatus: (signal) => fetchStatus(processId, signal),
          intervalMs: options.pollIntervalMs,
        },
        {
          onError: (apiError) => {
            setError(apiError);
            setStatus("error");
            clearPersisted();
          },
          onUpdate: (snapshot) => {
            setStatus(snapshot.status);
            if (snapshot.data !== undefined) {
              setData(snapshot.data);
            }
            if (snapshot.status !== "pending") {
              clearPersisted();
            }
          },
        }
      );
    } else {
      const { sseUrl, sseEventNames } = options;
      if (!(sseUrl && sseEventNames)) {
        throw new Error(
          'useProcess: `sseUrl` and `sseEventNames` are required when transport is "sse"'
        );
      }
      const subscription = subscribeSse(sseUrl(processId), {
        eventNames: sseEventNames,
        headers: options.sseHeaders,
        onDone: () => {
          setStatus("done");
          clearPersisted();
        },
        onError: (apiError) => {
          setError(apiError);
          setStatus("error");
          clearPersisted();
        },
        onEvent: (event) => {
          try {
            setData(JSON.parse(event.data) as T);
          } catch {
            // Non-JSON payload for this frame — ignore rather than tear down the subscription.
          }
        },
        terminalEventNames: options.sseTerminalEventNames,
      });
      cancelRef.current = () => subscription.cancel();
    }

    return () => cancelRef.current();
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [processId, options.transport, options.pollIntervalMs, options.enabled]);

  return {
    cancel: () => {
      cancelRef.current();
      // An explicit user-initiated cancel (unlike the effect's own unmount
      // cleanup above) means the job is no longer worth resuming — nothing
      // should try to pick it back up on the next mount/reload.
      if (options.persistKey) {
        clearPendingProcess(options.persistKey);
      }
    },
    data,
    error,
    status,
  };
};

export {
  clearPendingProcess,
  loadPendingProcess,
} from "../core/process-storage";
export type { PersistedProcess } from "../core/process-storage";
