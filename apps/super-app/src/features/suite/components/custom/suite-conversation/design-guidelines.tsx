"use client";

import { useMemo } from "react";

import ChatSmithIcon from "@/features/suite/assets/icons/chat-smith-icon.svg";
import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/features/suite/components/ui/ai-elements/chain-of-thought";
import { MessageResponse } from "@/features/suite/components/ui/ai-elements/message";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";
import {
  getPhaseLineDescDurationMs,
  getPhaseLineLabelDurationMs,
} from "@/features/suite/utils/constants/text-animation";

import type { SuiteDesignGuidelinesProps } from "./types";
import { usePhaseAnimation } from "./use-phase-animation";

export function SuiteDesignGuidelines({
  title = "Design concepts",
  sections,
  open,
  className,
  isAnimating,
  onAnimationComplete,
}: SuiteDesignGuidelinesProps) {
  const items = useMemo(
    () => sections.map((s) => ({ description: s.coreConcept, label: s.label })),
    [sections]
  );
  const animatingPhase = usePhaseAnimation(
    items,
    isAnimating,
    onAnimationComplete
  );

  return (
    <ChainOfThought
      data-testid={DATA_TEST_ID.suite.custom.suiteDesignGuidelines}
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
      <ChainOfThoughtContent className="gap-v1-structural-content-normal px-v1-structural-component-large">
        {items.map((item, i) => {
          const stepVisible = animatingPhase >= i * 2;
          if (!stepVisible) {
            return null;
          }
          return (
            <ChainOfThoughtStep
              key={`${item.label}-${i}`}
              className="animate-none!"
              labelDurationMs={
                isAnimating
                  ? getPhaseLineLabelDurationMs(item.label)
                  : undefined
              }
              descDurationMs={
                isAnimating
                  ? getPhaseLineDescDurationMs(item.description)
                  : undefined
              }
              label={
                <MessageResponse
                  className="typo-v1-title-sm [&>p]:m-0"
                  animated
                  isAnimating={animatingPhase === i * 2}
                >
                  {item.label}
                </MessageResponse>
              }
              description={
                animatingPhase >= i * 2 + 1 ? (
                  <MessageResponse
                    className="typo-v1-support-secondary-normal ms-1.5 list-disc [&>p]:m-0"
                    animated
                    isAnimating={animatingPhase === i * 2 + 1}
                  >
                    {`- ${item.description}`}
                  </MessageResponse>
                ) : null
              }
            />
          );
        })}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}
