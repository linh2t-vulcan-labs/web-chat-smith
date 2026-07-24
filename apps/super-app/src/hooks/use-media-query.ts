"use client";

import { useLayoutEffect, useState } from "react";

type TBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

interface TOptions {
  defaultValue?: boolean;
}

const tailwindBreakpoints: Record<TBreakpoint, number> = {
  "2xl": 1536,
  lg: 1024,
  md: 768,
  sm: 640,
  xl: 1280,
};

export function useMediaQuery(
  breakpoint: TBreakpoint,
  { defaultValue = false }: TOptions = {}
): boolean {
  const [isMatched, setIsMatched] = useState(defaultValue);

  // `useLayoutEffect` (not `useEffect`) resolves the real match before the
  // browser paints — consumers like ManageAccountModal switch their entire
  // layout (Modal vs Sheet) on this value, so a post-paint correction was
  // showing the wrong layout first and then snapping to the right one.
  useLayoutEffect(() => {
    const minWidth = tailwindBreakpoints[breakpoint];
    const mediaQuery = window.matchMedia(`(min-width: ${minWidth}px)`);

    const handleChange = () => setIsMatched(mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [breakpoint]);

  return isMatched;
}
