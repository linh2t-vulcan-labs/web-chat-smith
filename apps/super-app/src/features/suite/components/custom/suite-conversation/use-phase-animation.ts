"use client";

import { useEffect, useRef, useState } from "react";

import {
  getTextAnimationDurationMs,
  SUITE_TEXT_ANIMATION_PHASE_BUFFER_MS,
} from "@/features/suite/utils/constants/text-animation";

function calcDuration(text: string) {
  return getTextAnimationDurationMs(
    text.length,
    SUITE_TEXT_ANIMATION_PHASE_BUFFER_MS
  );
}

export interface PhaseAnimationItem {
  label: string;
  description: string;
}

/**
 * Phase-based animation for label → description → label → description sequence.
 * Even phase = label animating, odd phase = description animating.
 * Infinity = static mode (all items visible immediately, no animation).
 */
export function usePhaseAnimation(
  items: PhaseAnimationItem[],
  isAnimating: boolean | undefined,
  onComplete?: () => void
) {
  const initialIsAnimatingRef = useRef(isAnimating);
  const [animatingPhase, setAnimatingPhase] = useState<number>(
    // oxlint-disable-next-line react/react-compiler -- lazy useState initializer intentionally reads the ref's initial-mount snapshot of isAnimating, evaluated only once
    () => (initialIsAnimatingRef.current ? -1 : Infinity)
  );
  const sequenceStartedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    if (items.length === 0 || sequenceStartedRef.current) {
      return;
    }
    if (animatingPhase === -1) {
      sequenceStartedRef.current = true;
      // oxlint-disable-next-line react/react-compiler -- kicks off the animation sequence once per mount, guarded by sequenceStartedRef; intentional one-shot trigger, not a render derivation
      setAnimatingPhase(0);
    }
  }, [items.length, animatingPhase]);

  useEffect(() => {
    if (animatingPhase < 0 || animatingPhase === Infinity) {
      return;
    }
    const totalPhases = items.length * 2;

    if (animatingPhase >= totalPhases) {
      onCompleteRef.current?.();
      return;
    }

    const itemIndex = Math.floor(animatingPhase / 2);
    const part = animatingPhase % 2; // 0 = label, 1 = description
    const item = items[itemIndex];
    if (!item) {
      return;
    }

    const text = part === 0 ? item.label : item.description;
    const timer = setTimeout(() => {
      setAnimatingPhase((p) => p + 1);
    }, calcDuration(text));

    return () => clearTimeout(timer);
  }, [animatingPhase, items]);

  return animatingPhase;
}
