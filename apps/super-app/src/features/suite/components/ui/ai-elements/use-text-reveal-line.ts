"use client";

import { useLayoutEffect, useRef } from "react";

// Easing window the line uses to catch up when the revealed text wraps to a new line.
// The boundary (bottom of the last revealed char) only changes in line-height steps, so a
// short linear transition turns those steps into smooth growth without lagging the text.
const LINE_CATCHUP_MS = 250;

/**
 * Drives a vertical connector line by the ACTUAL revealed text instead of a timer estimate.
 *
 * Streamdown fades each character via CSS (`[data-sd-animate]` spans); whitespace and
 * separators render instantly with no span, so `charCount * stagger` always overshoots the
 * real animation. Each frame we advance to the last char whose fade has crossed 0.5 opacity
 * and set the line height to that char's bottom — so the line reaches exactly where the text
 * currently is, line by line, across label → description.
 *
 * @param animated   whether this step is streaming (false for history → static full line)
 * @param hasDescription whether the description has mounted yet (gates completion so we don't
 *                        stop during the label→description gap)
 */
export function useTextRevealLine(animated: boolean, hasDescription: boolean) {
  const lineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const animatedRef = useRef(animated);
  const hasDescRef = useRef(hasDescription);
  // oxlint-disable-next-line react/react-compiler -- ref is intentionally kept in sync with the latest hasDescription during render so the rAF loop below always reads the current value
  hasDescRef.current = hasDescription;

  useLayoutEffect(() => {
    if (!animatedRef.current || !lineRef.current || !contentRef.current) {
      return;
    }
    const lineEl = lineRef.current;
    const content = contentRef.current;
    lineEl.style.height = "0px";
    lineEl.style.transition = `height ${LINE_CATCHUP_MS}ms linear`;

    let raf = 0;
    let idx = 0; // first not-yet-visible animated span (advances only forward)
    const step = () => {
      const spans = content.querySelectorAll<HTMLElement>("[data-sd-animate]");
      let currentSpan = spans[idx];
      while (
        currentSpan &&
        Number(getComputedStyle(currentSpan).opacity) > 0.5
      ) {
        idx += 1;
        currentSpan = spans[idx];
      }
      const boundary = spans[idx - 1];
      const contentTop = content.getBoundingClientRect().top;
      const h = boundary
        ? boundary.getBoundingClientRect().bottom - contentTop
        : 0;
      lineEl.style.height = `${Math.min(Math.max(h, 0), content.offsetHeight)}px`;

      const lastSpan = [...spans].at(-1);
      const allRevealed =
        spans.length > 0 &&
        lastSpan !== undefined &&
        Number(getComputedStyle(lastSpan).opacity) > 0.95;
      if (hasDescRef.current && allRevealed) {
        lineEl.style.height = `${content.offsetHeight}px`;
        return;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return { contentRef, lineRef };
}
