"use client";

import { toast } from "@cs/ui/components/shadcn/toast";
import { useExtracted } from "next-intl";
import { useEffect, useRef, useSyncExternalStore } from "react";

// oxlint-disable-next-line promise/prefer-await-to-callbacks -- this is `useSyncExternalStore`'s subscribe contract (React calls it with a callback to re-run the snapshot), not a Node-style callback to refactor.
const subscribe = (callback: () => void) => {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
};

const getSnapshot = () => !navigator.onLine;
const getServerSnapshot = () => false;

/**
 * The one legitimate global/toast-worthy case in this app's error UX:
 * connectivity isn't tied to any single region, so it doesn't fit the
 * inline-error-in-place-of-toast convention used everywhere else (see
 * `InlineError`/`useApiErrorCopy`). Shown as a persistent banner while
 * offline (not a toast — the state is ongoing, not a one-shot event), with
 * a single toast on reconnect.
 */
export const OfflineBanner = () => {
  const t = useExtracted();
  const isOffline = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  const wasOffline = useRef(isOffline);

  useEffect(() => {
    if (wasOffline.current && !isOffline) {
      toast.add({
        title: t({
          id: "Common.connectivity.backOnline",
          message: "Back online",
        }),
        type: "success",
      });
    }
    wasOffline.current = isOffline;
  }, [isOffline, t]);

  if (!isOffline) {
    return null;
  }

  return (
    <output className="block w-full bg-destructive px-4 py-2 text-center text-destructive-foreground text-sm">
      {t({
        id: "Common.connectivity.offline",
        message: "You're offline — some features may not work.",
      })}
    </output>
  );
};
