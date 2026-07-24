"use client";

import { useEffect, useRef, useState } from "react";

// Number of seconds in an hour / minute — named to avoid magic numbers in the math below.
const SECONDS_PER_HOUR = 3600;
const SECONDS_PER_MINUTE = 60;

/** Pads a number to two digits so the clock reads e.g. "03:00:47". */
function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function nowInSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Counts down to a quota reset and re-renders every second.
 *
 * @param resetAt Unix timestamp (seconds) when the quota window resets.
 * @param onExpired Called once when the countdown reaches zero.
 * @returns "HH:MM:SS" until reset, or `null` when there is nothing to count down to or the countdown has expired.
 */
export function useQuotaCountdown(
  resetAt?: number,
  onExpired?: () => void
): string | null {
  const [now, setNow] = useState(nowInSeconds);
  const onExpiredRef = useRef(onExpired);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-callback ref updated during render so the interval below always calls the newest onExpired without restarting the timer
  onExpiredRef.current = onExpired;

  useEffect(() => {
    if (!resetAt) {
      return;
    }

    // Re-sync immediately on mount/resetAt change so we don't show a stale tick.
    // oxlint-disable-next-line react/react-compiler -- immediate resync to the true current time on mount/resetAt change, synchronizing with the system clock (external source), not a render derivation
    setNow(nowInSeconds());
    const intervalId = setInterval(() => {
      const current = nowInSeconds();
      setNow(current);
      if (current >= resetAt) {
        clearInterval(intervalId);
        onExpiredRef.current?.();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [resetAt]);

  if (!resetAt) {
    return null;
  }

  const remainingSeconds = Math.max(0, resetAt - now);
  if (remainingSeconds === 0) {
    return null;
  }

  const hours = Math.floor(remainingSeconds / SECONDS_PER_HOUR);
  const minutes = Math.floor(
    (remainingSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE
  );
  const seconds = remainingSeconds % SECONDS_PER_MINUTE;

  return `${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
}
