"use client";

import { useEffect } from "react";

import { flagsEngine } from "@/lib/flags";
import { FlagsProvider as FlagsProviderImpl } from "@/lib/flags-react";

/**
 * Module-level, not per-mount: `flagsEngine()` returns a shared singleton,
 * so once one mount has kicked off `init()`, remounts of this provider
 * (e.g. this whole subtree remounting on a locale switch — see
 * `app/[locale]/(workspace)/layout.tsx`'s comment) should reuse that
 * in-flight/completed fetch instead of re-triggering a real Firebase Remote
 * Config request every time.
 */
let initPromise: Promise<void> | undefined;

/**
 * `createFlagsEngine` doesn't auto-fetch — `init()` must be called once
 * client-side to fetch/activate Remote Config. Doing it here (not inside
 * `lib/flags.ts`) keeps that module free of side effects on import.
 */
export const FlagsProvider = ({ children }: { children: React.ReactNode }) => {
  const engine = flagsEngine();

  useEffect(() => {
    initPromise ??= engine.init();
  }, [engine]);

  return <FlagsProviderImpl engine={engine}>{children}</FlagsProviderImpl>;
};
