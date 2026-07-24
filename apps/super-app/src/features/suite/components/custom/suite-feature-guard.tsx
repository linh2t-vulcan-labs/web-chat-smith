"use client";

import type { ReactNode } from "react";

import { useSuiteFeatureGuard } from "@/features/suite/hooks/use-suite-feature-guard";

export function SuiteFeatureGuard({
  children,
  isAuthenticated,
}: {
  children: ReactNode;
  isAuthenticated: boolean;
}) {
  useSuiteFeatureGuard({ isAuthenticated });
  return children;
}
