"use client";

import { useEffect } from "react";

import { flagsEngine } from "@/lib/flags";
import { FlagsProvider as FlagsProviderImpl } from "@/lib/flags-react";

/**
 * `createFlagsEngine` doesn't auto-fetch — `init()` must be called once
 * client-side to fetch/activate Remote Config. Doing it here (not inside
 * `lib/flags.ts`) keeps that module free of side effects on import.
 */
export const FlagsProvider = ({ children }: { children: React.ReactNode }) => {
  const engine = flagsEngine();

  useEffect(() => {
    engine.init();
  }, [engine]);

  return <FlagsProviderImpl engine={engine}>{children}</FlagsProviderImpl>;
};
