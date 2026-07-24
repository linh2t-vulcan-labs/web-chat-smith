import { useEffect, useRef, useState } from "react";

const THRESHOLD = 10;

export const useThreadBlurContent = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  const checkScroll = () => {
    const element = scrollRef.current;

    if (!element) {
      return;
    }
    const scrollable = element.scrollHeight >= element.clientHeight;
    const scrolledToBottom =
      element.scrollTop + element.clientHeight >=
      element.scrollHeight - THRESHOLD;

    setIsScrollable(scrollable);
    setAtBottom(scrolledToBottom);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) {
      return;
    }

    checkScroll(); // run on mount

    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll); // in case layout changes

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return {
    atBottom,
    checkScrollBlur: checkScroll,
    isScrollable,
    scrollRef,
  };
};
