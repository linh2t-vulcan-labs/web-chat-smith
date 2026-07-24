"use client";

import { useEffect, useState } from "react";

import { Steps } from "@/components/steps";
import type { TStepsProps } from "@/components/steps/types";
import { compositeStyles } from "@/utils/commons/styles";

import type { TProgressThinkingProps } from "./types";

function ProgressThinking(props: TProgressThinkingProps) {
  const {
    title,
    content,
    delayTime = 5000,
    steps,
    contentClassName,
    status = "pending",
  } = props;
  const [internalSteps, setInternalSteps] = useState<TStepsProps["items"]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (status === "completed") {
      // Instantly finalize all steps as completed
      // oxlint-disable-next-line react/react-compiler -- effect derives finalized step list from the `status` prop transitioning to "completed"; idempotent, false positive
      setInternalSteps(
        steps.map((step) => ({
          ...step,
          state: "completed",
        }))
      );
      setStepIndex(steps.length);
      return;
    }

    // For "pending" state: start first step as loading
    if (status === "pending") {
      const [firstStep] = steps;
      setInternalSteps(firstStep ? [{ ...firstStep, state: "loading" }] : []);
      setStepIndex(0);
    }
  }, [status, steps]);

  useEffect(() => {
    if (status !== "pending") {
      return;
    }
    if (stepIndex >= steps.length - 1) {
      return;
    }

    const currentStep = steps[stepIndex];
    const delay = currentStep?.delay ?? delayTime;

    const timer = setTimeout(() => {
      setInternalSteps((prev) => {
        const updated = [...prev];
        if (updated[stepIndex]) {
          updated[stepIndex] = { ...updated[stepIndex], state: "completed" };
        }

        const nextStep = steps[stepIndex + 1];
        if (nextStep) {
          updated.push({ ...nextStep, state: "loading" });
        }

        return updated;
      });

      setStepIndex((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [stepIndex, delayTime, steps, status]);

  return (
    <div className="bg-gradient-glassmorphism-light dark:bg-gradient-glassmorphism rounded-default flex size-full flex-col backdrop-blur-[50px]">
      <div className="px-small-0.75 py-small-0.5">{title}</div>
      <div className="flex h-[252px]">
        <div className="bg-surface-general-soft dark:bg-surface-inputControl-basic-default rounded-t-default py-medium-1.5 pe-medium-3 ps-large-4 size-full max-w-[195px]">
          <Steps items={internalSteps} />
        </div>
        <div
          className={compositeStyles(
            "px-small-1 pt-small-1 pb-medium-1.5 inline-flex size-full flex-col overflow-y-auto",
            contentClassName
          )}
        >
          {content}
        </div>
      </div>
    </div>
  );
}

export default ProgressThinking;
