"use client";

import dynamic from "next/dynamic";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Step } from "react-joyride";

import type {
  TGuideTourContext,
  TGuideTourState,
  TJoyrideOptions,
} from "./types";

// react-joyride v3 dropped its default export — pull the named `Joyride`.
const Joyride = dynamic(
  async () => {
    const m = await import("react-joyride");
    return m.Joyride;
  },
  {
    ssr: false,
  }
);
const GuideTourContext = createContext<TGuideTourContext | null>(null);
const DEFAULT_JOYRIDE_OPTIONS: TJoyrideOptions = {};

export function GuideTourProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TGuideTourState>({
    options: DEFAULT_JOYRIDE_OPTIONS,
    run: false,
    steps: [],
  });

  const startTour = useCallback((steps: Step[], options?: TJoyrideOptions) => {
    // merge global defaults + passed options
    const mergedOptions = { ...DEFAULT_JOYRIDE_OPTIONS, ...options };

    setState({
      options: mergedOptions,
      run: true,
      steps,
    });
  }, []);

  const stopTour = useCallback(() => {
    setState((prev) => ({ ...prev, run: false }));
  }, []);

  // Expose context value
  const value = useMemo(
    () => ({
      currentSteps: state.steps,
      isRunning: state.run,
      startTour,
      stopTour,
    }),
    [startTour, stopTour, state.run, state.steps]
  );

  return (
    <GuideTourContext value={value}>
      {children}
      <Joyride
        steps={state.steps}
        run={state.run}
        continuous
        styles={{
          overlay: {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          },
        }}
        {...state.options}
      />
    </GuideTourContext>
  );
}

export function useGuideTour() {
  const ctx = useContext(GuideTourContext);
  if (!ctx) {
    throw new Error("useGuideTour must be used inside GuideTourProvider");
  }
  return ctx;
}
