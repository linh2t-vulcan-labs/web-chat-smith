import { useIntersectionObserver } from "@uidotdev/usehooks";
import { useEffect, useRef } from "react";

interface TUseInfiniteScrollObserverOptions {
  hasNextPage: boolean;
  loading: boolean;
  fn: () => void;
  enabled?: boolean;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Custom hook to handle infinite scroll with intersection observer
 * Prevents multiple calls to fetchNextPage when scrolling to the bottom
 */
export function useInfiniteScrollObserver({
  hasNextPage,
  loading,
  fn,
  enabled = true,
  threshold = 0,
  rootMargin = "0px",
}: TUseInfiniteScrollObserverOptions): (instance: Element | null) => void {
  const hasMountedRef = useRef(false);
  const prevIsIntersectingRef = useRef(false);
  const hasTriggeredFetchRef = useRef(false);

  const [ref, entry] = useIntersectionObserver({
    root: null,
    rootMargin,
    threshold,
  });

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      prevIsIntersectingRef.current = entry?.isIntersecting ?? false;
      return;
    }

    const isIntersecting = entry?.isIntersecting ?? false;
    const wasIntersecting = prevIsIntersectingRef.current;

    // Reset trigger flag when element leaves viewport
    if (!isIntersecting && wasIntersecting) {
      hasTriggeredFetchRef.current = false;
    }

    // Check if we should trigger fetch
    const shouldFetch =
      isIntersecting &&
      !wasIntersecting &&
      hasNextPage &&
      !loading &&
      !hasTriggeredFetchRef.current &&
      enabled;

    if (shouldFetch) {
      hasTriggeredFetchRef.current = true;
      fn();
    }

    prevIsIntersectingRef.current = isIntersecting;
  }, [entry?.isIntersecting, hasNextPage, loading, fn, enabled]);

  return ref;
}
