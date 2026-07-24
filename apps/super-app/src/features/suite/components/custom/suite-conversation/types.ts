import type { HTMLAttributes, ReactNode, Ref } from "react";
import type { StickToBottomContext } from "use-stick-to-bottom";

export interface ModeChipProps {
  label: string;
  className?: string;
}

export interface SuiteUserMessageProps {
  children: ReactNode;
  images?: string[];
  maxImages?: number;
  showFailed?: boolean;
  className?: string;
}

export interface SuiteBotMessageProps {
  children: ReactNode;
  className?: string;
  isAnimating?: boolean;
  onAnimationComplete?: () => void;
}

export interface ThinkingStepProps {
  label: string;
  description: string;
}

export interface SuiteThinkingProps {
  title?: string;
  steps: ThinkingStepProps[];
  open?: boolean;
  className?: string;
  isAnimating?: boolean;
  onAnimationComplete?: () => void;
}

export interface DesignGuidelineSectionProps {
  label: string;
  coreConcept: string;
}

export interface SuiteDesignGuidelinesProps {
  title?: string;
  status?: "generating" | "complete";
  sections: DesignGuidelineSectionProps[];
  open?: boolean;
  className?: string;
  isAnimating?: boolean;
  onAnimationComplete?: () => void;
}

export interface SuiteGeneratingProps {
  durationMs: number;
  imageCount: number;
  label: string;
  className?: string;
}

export interface SuiteGeneratedProps {
  title: string;
  images: (string | null)[];
  className?: string;
}

export interface SuiteMessageBotErrorProps {
  title?: string;
  description?: string;
  className?: string;
}

export type SuiteConversationProps = HTMLAttributes<HTMLDivElement> & {
  contextRef?: Ref<StickToBottomContext>;
};
