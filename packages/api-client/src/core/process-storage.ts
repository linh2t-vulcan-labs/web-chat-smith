import type { ProcessTransport } from "../types";

const STORAGE_PREFIX = "cs-process:";

export interface PersistedProcess {
  processId: string;
  transport: ProcessTransport;
  startedAt: number;
}

const storageKey = (key: string): string => `${STORAGE_PREFIX}${key}`;

/**
 * A long-running job (chat/deep-research/image-gen/design-studio) lives on
 * the backend independently of any client connection (see
 * docs/runbook/api-client.md §10) — closing the tab, closing the laptop lid,
 * or a reload does not stop it. What's missing without this is purely
 * client-side "which job was I watching?" — `localStorage` (not
 * `sessionStorage`: must survive the tab itself being closed and reopened,
 * not just a same-tab navigation) lets a page recover that on mount instead
 * of the job becoming untrackable the moment React state is lost.
 *
 * `key` should be caller-scoped (e.g. `conversation:${conversationId}`) so
 * concurrent jobs across different entities never collide.
 */
export const savePendingProcess = (
  key: string,
  process: PersistedProcess
): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(storageKey(key), JSON.stringify(process));
  } catch {
    // Storage unavailable (private mode, quota exceeded) — resumability
    // degrades gracefully to "no persisted job found", not a crash.
  }
};

export const loadPendingProcess = (key: string): PersistedProcess | null => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(storageKey(key));
    return raw ? (JSON.parse(raw) as PersistedProcess) : null;
  } catch {
    return null;
  }
};

export const clearPendingProcess = (key: string): void => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(storageKey(key));
  } catch {
    // Nothing to clean up if storage was never writable to begin with.
  }
};
