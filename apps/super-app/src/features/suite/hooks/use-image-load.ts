"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type ImageLoadStatus = "loading" | "loaded" | "error";

type ImageLoadState = Record<string, ImageLoadStatus>;

interface GetImageLoadStateOptions {
  hasExternalError?: boolean;
  shouldLoad?: boolean;
}

export const useImageLoad = (imageKeys: readonly string[]) => {
  const [imageLoadState, setImageLoadState] = useState<ImageLoadState>({});
  const stableImageKey = imageKeys.join("\u0000");

  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- resyncs tracked image keys whenever the joined key set changes, preserving existing per-key statuses; external-list-driven resync, not a render derivation
    setImageLoadState((prev) => {
      const next: ImageLoadState = {};

      for (const key of imageKeys) {
        next[key] = prev[key] ?? "loading";
      }

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableImageKey]);

  const setImageStatus = useCallback((key: string, status: ImageLoadStatus) => {
    setImageLoadState((prev) => {
      if (prev[key] === status) {
        return prev;
      }

      return {
        ...prev,
        [key]: status,
      };
    });
  }, []);

  return useMemo(
    () => ({
      getImageLoadState: (key: string, options?: GetImageLoadStateOptions) => {
        const status = options?.hasExternalError
          ? "error"
          : (imageLoadState[key] ?? "loading");
        const canLoad = options?.shouldLoad ?? true;

        return {
          isError: status === "error",
          isLoaded: status === "loaded",
          isLoading: !canLoad || status === "loading",
          status,
        };
      },
      getImageStatus: (key: string) => imageLoadState[key] ?? "loading",
      handleImageError: (key: string) => setImageStatus(key, "error"),
      handleImageLoad: (key: string) => setImageStatus(key, "loaded"),
    }),
    [imageLoadState, setImageStatus]
  );
};
