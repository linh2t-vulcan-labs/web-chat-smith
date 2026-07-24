"use client";

import React, { forwardRef, useEffect, useRef, useState } from "react";

import type { TLazyInViewProps } from "./types";

const LazyInView = forwardRef<HTMLDivElement, TLazyInViewProps>(
  (
    {
      children,
      rootMargin = "200px",
      threshold = 0,
      placeholder = null,
      once = true,
      className,
      style,
    },
    ref
  ) => {
    const wrapperRef = useRef<HTMLDivElement | null>(null);

    // sync forwarded ref
    useEffect(() => {
      if (!ref) {
        return;
      }
      if (typeof ref === "function") {
        ref(wrapperRef.current);
      } else {
        (ref as React.MutableRefObject<HTMLDivElement | null>).current =
          wrapperRef.current;
      }
    }, [ref]);

    const [isInView, setIsInView] = useState(false);
    const hasBeenInView = useRef(false);

    useEffect(() => {
      if (typeof window === "undefined") {
        return;
      }
      if (isInView && once) {
        return;
      }

      const el = wrapperRef.current;
      if (!el) {
        return;
      }

      if (typeof IntersectionObserver === "undefined") {
        // oxlint-disable-next-line react/react-compiler -- feature-detection fallback setState inside effect when IntersectionObserver is unsupported
        setIsInView(true);
        hasBeenInView.current = true;
        return;
      }

      const obs = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
              setIsInView(true);
              hasBeenInView.current = true;
              if (once) {
                obs.disconnect();
              }
            } else if (!once) {
              setIsInView(false);
            }
          }
        },
        { rootMargin, threshold }
      );

      obs.observe(el);
      return () => obs.disconnect();
    }, [rootMargin, threshold, once, isInView]);

    // oxlint-disable-next-line react/react-compiler -- reads hasBeenInView.current during render to derive shouldRender; intentional "sticky once visible" pattern
    const shouldRender = isInView || (once && hasBeenInView.current);
    return (
      <div
        ref={wrapperRef}
        className={className}
        style={style}
        // oxlint-disable-next-line react/react-compiler -- aria-busy derives from a ref-backed value (hasBeenInView.current) read during render
        aria-busy={!shouldRender}
      >
        {shouldRender ? children : placeholder}
      </div>
    );
  }
);

LazyInView.displayName = "ChoiceButton";
export default LazyInView;
