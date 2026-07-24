"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

import ChatSmithIcon from "@/features/suite/assets/icons/chat-smith-icon.svg";
import StarBorder from "@/features/suite/components/custom/star-border";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
} from "@/features/suite/components/ui/ai-elements/chain-of-thought";
import { MessageResponse } from "@/features/suite/components/ui/ai-elements/message";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";
import {
  getPhaseLineDescDurationMs,
  getPhaseLineLabelDurationMs,
} from "@/features/suite/utils/constants/text-animation";

import { AnalysisIcon } from "./analysis-icon";
import type { SuiteThinkingProps, ThinkingStepProps } from "./types";

// Per step the reveal runs: lottie icon (includes its own check) -> label streams -> description
// streams. "icon" is advanced by the lottie's onComplete; "label"/"desc" by timers sized to the
// streamed text. Steps run one after another; when the last description finishes, onComplete fires.
type StepSubPhase = "icon" | "label" | "desc";

function useThoughtSequence(
  steps: ThinkingStepProps[],
  isAnimating: boolean | undefined,
  onComplete?: () => void
) {
  // Static mode (history / not animating): everything is already done.
  const [activeIndex, setActiveIndex] = useState(() =>
    isAnimating ? 0 : Infinity
  );
  const [subPhase, setSubPhase] = useState<StepSubPhase>("icon");
  const startedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  // Kick the sequence off once steps arrive (the block renders with steps:[] first).
  useEffect(() => {
    if (!isAnimating || startedRef.current || steps.length === 0) {
      return;
    }
    startedRef.current = true;
    setActiveIndex(0);
    setSubPhase("icon");
  }, [isAnimating, steps.length]);

  // Drive label -> desc and desc -> next step via timers; the whole sequence completes here.
  useEffect(() => {
    if (activeIndex === Infinity || steps.length === 0) {
      return;
    }
    if (activeIndex >= steps.length) {
      onCompleteRef.current?.();
      return;
    }
    const step = steps[activeIndex];
    if (!step || subPhase === "icon") {
      return;
    } // "icon" is advanced by the lottie callback

    const duration =
      subPhase === "label"
        ? getPhaseLineLabelDurationMs(step.label)
        : getPhaseLineDescDurationMs(step.description);

    const timer = setTimeout(() => {
      if (subPhase === "label") {
        setSubPhase("desc");
      } else {
        setActiveIndex((i) => i + 1);
        setSubPhase("icon");
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [activeIndex, subPhase, steps]);

  const onIconComplete = () => setSubPhase((p) => (p === "icon" ? "label" : p));

  return { activeIndex, onIconComplete, subPhase };
}

interface ThoughtStepRowProps {
  step: ThinkingStepProps;
  state: "done" | StepSubPhase;
  onIconComplete?: () => void;
}

function ThoughtStepRow({ step, state, onIconComplete }: ThoughtStepRowProps) {
  const showLabel = state === "done" || state === "label" || state === "desc";
  const showDesc = state === "done" || state === "desc";

  return (
    <div className="flex flex-row items-start self-stretch">
      <div className="gap-v1-structural-content-micro px-v1-structural-content-normal flex w-29.25 shrink-0 flex-row items-center py-1">
        <AnalysisIcon play={state === "icon"} onComplete={onIconComplete} />
        {showLabel && (
          <MessageResponse
            className="typo-v1-title-sm text-v1-text-hierarchy-primary [&>p]:m-0"
            animated
            isAnimating={state === "label"}
          >
            {step.label}
          </MessageResponse>
        )}
      </div>

      <div className="px-v1-structural-content-normal flex min-w-0 flex-1 flex-row py-1">
        {showDesc && (
          <MessageResponse
            className="typo-v1-support-secondary-normal text-v1-text-hierarchy-primary wrap-break-word [&>p]:m-0"
            animated
            isAnimating={state === "desc"}
          >
            {step.description}
          </MessageResponse>
        )}
      </div>
    </div>
  );
}

export function SuiteThinking({
  title = "Though",
  steps,
  open,
  className,
  isAnimating,
  onAnimationComplete,
}: SuiteThinkingProps) {
  const { activeIndex, subPhase, onIconComplete } = useThoughtSequence(
    steps,
    isAnimating,
    onAnimationComplete
  );

  const stepRows = steps.map((step, i) => {
    if (i > activeIndex) {
      return null;
    } // future steps aren't revealed yet
    const state: "done" | StepSubPhase = i < activeIndex ? "done" : subPhase;
    return (
      <ThoughtStepRow
        key={step.label}
        step={step}
        state={state}
        onIconComplete={i === activeIndex ? onIconComplete : undefined}
      />
    );
  });

  // No steps yet (still "Analyzing…") → render no card so the animated border doesn't show
  // as an empty box. The header shimmer carries the in-progress state.
  let stepsContent: ReactNode = null;
  if (steps.length > 0) {
    stepsContent = isAnimating ? (
      <StarBorder
        as="div"
        className="rounded-v1-large block w-full"
        color="white"
        speed="5s"
        innerClassName="rounded-v1-large border-v1-action-border-ghost bg-v1-panel-background-primary py-v1-structural-content-tight border"
      >
        {stepRows}
      </StarBorder>
    ) : (
      <div className="rounded-v1-large border-v1-action-border-ghost py-v1-structural-content-tight border">
        {stepRows}
      </div>
    );
  }

  return (
    <ChainOfThought
      data-testid={DATA_TEST_ID.suite.custom.suiteThinking}
      className={className}
      open={open}
    >
      <ChainOfThoughtHeader
        className="px-v1-structural-content-tight"
        icon={
          <ChatSmithIcon
            className="text-v1-icons-hierarchy-secondary size-6"
            aria-hidden
          />
        }
        status={isAnimating ? "generating" : "complete"}
        hasArrowIcon={!isAnimating}
      >
        {title}
      </ChainOfThoughtHeader>

      {/* Card lives inside ChainOfThoughtContent so it collapses (and the border disappears) when
          the header is toggled closed. Animated white StarBorder while thinking, static border once done. */}
      <ChainOfThoughtContent className="gap-v1-structural-content-normal">
        {stepsContent}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}
