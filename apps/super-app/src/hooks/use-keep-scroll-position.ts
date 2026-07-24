import { useEffect, useRef } from "react";

import type { TMessageTemp } from "@/core/models/conversation";

export const useKeepScrollPosition = (messages: TMessageTemp[]) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isPrependingRef = useRef(false);
  const prevScrollHeightRef = useRef<number>(0);

  useEffect(() => {
    if (!isPrependingRef.current) {
      return;
    }

    const container = containerRef.current;
    if (container) {
      const scrollDiff = container.scrollHeight - prevScrollHeightRef.current;

      container.style.scrollBehavior = "auto";

      container.scrollTop += scrollDiff;
      container.style.scrollBehavior = "";
    }

    isPrependingRef.current = false;
  }, [messages.length]);

  return {
    containerRef,
    isPrependingRef,
    prevScrollHeightRef,
  };
};
