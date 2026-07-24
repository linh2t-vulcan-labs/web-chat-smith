"use client";

import { useTheme } from "@wrksz/themes/client";
import Lottie from "lottie-react";
import type { LottieRefCurrentProps } from "lottie-react";
import { useEffect, useRef } from "react";

import analysisDarkAnimation from "@/features/suite/assets/jsons/icon_analysis_checkmark_dark.json";
import analysisLightAnimation from "@/features/suite/assets/jsons/icon_analysis_checkmark_light.json";
import { cn } from "@/features/suite/utils/classnames";

interface AnalysisIconProps {
  /**
   * When true, plays the analysis animation once (the json includes the self-check at the end)
   * and calls onComplete. When false, holds the final checked frame without animating.
   */
  play: boolean;
  onComplete?: () => void;
  className?: string;
}

export function AnalysisIcon({
  play,
  onComplete,
  className,
}: AnalysisIconProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  // App theme is driven by @wrksz/themes (layout: ThemeProvider attribute="data-theme",
  // defaultTheme="dark"). resolvedTheme reflects the active theme; fall back to the dark asset until
  // it resolves (matches defaultTheme + SSR, so no hydration flash from the wrong variant).
  const { resolvedTheme } = useTheme();
  const animationData =
    resolvedTheme === "light" ? analysisLightAnimation : analysisDarkAnimation;

  // Static (already-done) step: jump to the last frame so the check is shown without replaying.
  // Re-runs when the themed animationData swaps so the new Lottie also lands on its final frame.
  useEffect(() => {
    if (play) {
      return;
    }
    const lottie = lottieRef.current;
    if (!lottie) {
      return;
    }
    const totalFrames = lottie.getDuration(true);
    if (totalFrames === null || totalFrames === undefined) {
      return;
    }
    lottie.goToAndStop(totalFrames - 1, true);
  }, [play, animationData]);

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={false}
      autoplay={play}
      onComplete={onComplete}
      className={cn("size-4 shrink-0", className)}
    />
  );
}
