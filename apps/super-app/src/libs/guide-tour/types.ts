import type { Props, Step } from "react-joyride";

export type TJoyrideOptions = Partial<Props>;

export interface TGuideTourContext {
  startTour: (steps: Step[], options?: TJoyrideOptions) => void;
  stopTour: () => void;
  isRunning: boolean;
  currentSteps: Step[];
}

export interface TGuideTourState {
  run: boolean;
  steps: Step[];
  options: TJoyrideOptions;
}
