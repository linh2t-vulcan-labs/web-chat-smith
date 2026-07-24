"use client";

import { useEffect } from "react";

/**
 * Code-split chunk filenames are content-hashed. A tab left open across a new
 * deploy (or, in dev, a Turbopack rebuild) still holds the old manifest and
 * requests chunks by their old hash, which 404s once the server has moved on —
 * surfacing as `ERR_ABORTED 404` / `ChunkLoadError` with no way to recover
 * short of a manual hard refresh. Reload once, automatically, to self-heal.
 *
 * A failed `next/dynamic()` import throws during render and is caught by the
 * nearest route `error.tsx` boundary, not by `window`'s `error`/
 * `unhandledrejection` events — so this same detection also needs to run from
 * inside those boundaries (see `useChunkErrorAutoReload` below), not just here.
 */
const RELOAD_GUARD_KEY = "cs-chunk-error-reload-guard";
const CLEAR_GUARD_AFTER_MS = 5000;

export function isChunkLoadError(message: string): boolean {
  return /loading chunk .* failed|chunkloaderror|loading css chunk|failed to fetch dynamically imported module/iu.test(
    message
  );
}

export function reloadOnceForChunkError() {
  if (sessionStorage.getItem(RELOAD_GUARD_KEY)) {
    return;
  }
  sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
  window.location.reload();
}

/** Use from a route `error.tsx` boundary: reloads once if `error` looks like a chunk-load failure. */
export function useChunkErrorAutoReload(error: Error | null | undefined) {
  useEffect(() => {
    if (error && isChunkLoadError(error.message)) {
      reloadOnceForChunkError();
    }
  }, [error]);
}

export function ChunkErrorRecovery() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (isChunkLoadError(event.message)) {
        reloadOnceForChunkError();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason as { message?: string } | undefined;
      const message = reason?.message ?? String(event.reason);
      if (isChunkLoadError(message)) {
        reloadOnceForChunkError();
      }
    };

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleRejection);

    // The page rendered without an immediate chunk error — clear a stale
    // guard from an earlier session so a future real deploy can still
    // trigger one recovery reload.
    const clearGuardTimer = setTimeout(() => {
      sessionStorage.removeItem(RELOAD_GUARD_KEY);
    }, CLEAR_GUARD_AFTER_MS);

    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleRejection);
      clearTimeout(clearGuardTimer);
    };
  }, []);

  return null;
}
