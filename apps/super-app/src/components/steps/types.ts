export type TStepState = "loading" | "completed";

export interface TStepProps {
  state: TStepState;
  description?: React.ReactNode;
  className?: string;
  delay?: number; // optional delay per step
}

export interface TStepsProps {
  items: (TStepProps & { key: React.Key })[];
  align?: "vertical" | "horizontal";
}
