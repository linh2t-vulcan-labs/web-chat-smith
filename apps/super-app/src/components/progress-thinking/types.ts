import type { TStepsProps } from "@/components/steps/types";

export interface TProgressThinkingProps {
  title: React.ReactNode;
  content: React.ReactNode;
  delayTime?: number;
  status?: "pending" | "completed";
  steps: TStepsProps["items"];
  contentClassName?: string;
}
