"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

import { TextShimmer } from "@/features/suite/components/ui/text-shimmer";
import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";
import { formatElapsed, formatTotal } from "@/features/suite/utils/format";

import { SuiteLoadingIcon } from "../suite-loading-icon";
import type { SuiteGeneratingProps } from "./types";

export function SuiteGenerating({
  durationMs,
  label,
  className,
}: SuiteGeneratingProps) {
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      data-testid={DATA_TEST_ID.suite.custom.suiteGenerating}
      className={cn("flex flex-row self-stretch", className)}
    >
      <div className="flex min-w-0 flex-1 flex-row items-center rounded-[24px]">
        <div className="p-v1-structural-content-tight flex min-w-0 flex-1 flex-row">
          <SuiteLoadingIcon />
          <div className="gap-v1-structural-content-tight px-v1-structural-content-tight flex min-w-0 flex-1 flex-col justify-center self-stretch">
            <TextShimmer
              as="span"
              className="typo-v1-heading-h5 text-v1-text-hierarchy-primary px-v1-structural-content-micro py-v1-optical-subtle h-fit self-stretch"
              style={
                {
                  "--base-color": "var(--color-v1-text-hierarchy-secondary)",
                  "--base-gradient-color":
                    "var(--color-v1-text-hierarchy-primary)",
                } as CSSProperties
              }
              duration={2}
            >
              {label}
            </TextShimmer>
          </div>
        </div>
        {/* right */}
        <div className="gap-v1-structural-content-tight py-v1-optical-strong flex w-fit flex-row items-center justify-end">
          <span className="typo-v1-support-secondary-normal text-v1-text-hierarchy-tertiary size-fit">
            {formatElapsed(elapsedSec)}
          </span>
          <div className="border-v1-border-structural-strong h-4 w-px border-s" />
          <span className="typo-v1-support-secondary-strong text-v1-text-hierarchy-primary size-fit">
            {formatTotal(durationMs)}
          </span>
        </div>
      </div>
    </div>
  );
}
