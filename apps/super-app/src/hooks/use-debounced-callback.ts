"use client";

import { useCallback, useRef } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic constraint must accept any callback signature (e.g. (x: SomeType) => void); `unknown[]` breaks contravariant assignability for typed callbacks.
function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFunction = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  return debouncedFunction;
}

export default useDebouncedCallback;
