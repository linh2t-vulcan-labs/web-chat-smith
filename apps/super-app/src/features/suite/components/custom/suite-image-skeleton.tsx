"use client";

import { Skeleton } from "@/features/suite/components/ui/skeleton";
import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

interface SuiteImageSkeletonProps {
  className?: string;
}

export function SuiteImageSkeleton({ className }: SuiteImageSkeletonProps) {
  return (
    <div
      data-testid={DATA_TEST_ID.suite.custom.suiteImageSkeleton}
      className={cn(
        "relative aspect-square w-full overflow-hidden rounded-md",
        className
      )}
    >
      <Skeleton className="inset-v1-optical-subtle bg-v1-surface-glass-dark-breath absolute rounded-md" />
      <div className="absolute top-0 end-0 p-2">
        <div className="flex items-center rounded px-2 py-1" />
      </div>
    </div>
  );
}
