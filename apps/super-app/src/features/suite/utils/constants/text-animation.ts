/**
 * Single source of truth for Streamdown's per-character streaming text animation.
 *
 * Streamdown applies the fade as pure CSS via its animate plugin (each char gets
 * `animation-delay = index * stagger` and `animation-duration = duration`). It does
 * NOT expose any "animation finished" event — `onAnimationEnd` only fires when the
 * `isAnimating` PROP flips true→false, which is circular for detecting completion.
 *
 * So the values below are consumed in two ways and MUST stay in sync:
 *   1. <Streamdown animated={SUITE_TEXT_ANIMATION}> — drives the real CSS fade.
 *   2. The animation queue / phase animation estimate when that fade ends with a
 *      timer derived from the same numbers (see getTextAnimationDurationMs).
 */
export const SUITE_TEXT_ANIMATION = {
  animation: "fadeIn",
  duration: 15, // ms: fade duration of a single character
  easing: "linear",
  sep: "char",
  stagger: 15, // ms: delay between consecutive characters
} as const;

/**
 * Safety slack added after the computed animation time before the queue advances,
 * so the next block never appends while the last char is still fading.
 *
 * BLOCK = applied once for a whole text block (bot message).
 * PHASE = applied per label/description in the guideline phase animation; it runs
 *         many short timers in sequence, so a smaller per-phase buffer is used to
 *         avoid accumulating slack across phases.
 */
const SUITE_TEXT_ANIMATION_BLOCK_BUFFER_MS = 120;
export const SUITE_TEXT_ANIMATION_PHASE_BUFFER_MS = 15;

/**
 * Estimated time (ms) for Streamdown to finish animating `charCount` characters,
 * matching the CSS the animate plugin applies: the last char starts at
 * (charCount - 1) * stagger and then fades for `duration`.
 */
export function getTextAnimationDurationMs(
  charCount: number,
  bufferMs: number = SUITE_TEXT_ANIMATION_BLOCK_BUFFER_MS
): number {
  const { stagger, duration } = SUITE_TEXT_ANIMATION;
  return Math.max(0, charCount - 1) * stagger + duration + bufferMs;
}

export function getPhaseLineLabelDurationMs(label: string): number {
  return getTextAnimationDurationMs(
    label.length,
    SUITE_TEXT_ANIMATION_PHASE_BUFFER_MS
  );
}

// The description renders as a markdown list (`- ${text}`), so the leading "- " is
// consumed as the bullet marker and is NOT part of the animated text. Time the line
// off description.length alone with no buffer so the line reaches the bottom exactly
// as the last char fades in (matched against measured data: 128 chars → 3840ms).
export function getPhaseLineDescDurationMs(description: string): number {
  return getTextAnimationDurationMs(description.length, 0);
}
