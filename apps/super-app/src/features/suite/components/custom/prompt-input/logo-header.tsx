"use client";

import { cn } from "@/features/suite/utils/classnames";
import {
  INDUSTRY,
  STYLE,
  TYPE,
} from "@/features/suite/utils/constants/conversation";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

import { Dropdown } from "../dropdown";
import type { PromptingInputLogoHeaderProps } from "./types";

export function PromptingInputLogoHeader({
  brandName,
  onBrandNameChange,
  industry,
  onIndustryChange,
  style,
  onStyleChange,
  type,
  onTypeChange,
}: PromptingInputLogoHeaderProps) {
  return (
    <div
      data-testid={DATA_TEST_ID.suite.custom.promptingInputLogoHeader}
      className="gap-v1-structural-content-tight px-v1-structural-component-medium pt-v1-structural-component-micro flex flex-row flex-wrap items-center overflow-hidden"
    >
      <span className="text-body-scale-200 text-v1-text-hierarchy-secondary opacity-60">
        Brand name:
      </span>
      <input
        className={cn(
          "text-functional-scale-2 text-v1-text-hierarchy-primary h-5 w-17.5 border-b border-dotted bg-transparent capitalize focus:outline-none",
          brandName
            ? "border-v1-border-interactive-active"
            : "border-v1-border-structural-default"
        )}
        placeholder=" "
        value={brandName}
        onChange={(e) => onBrandNameChange(e.target.value)}
      />
      <Dropdown
        label="Industry"
        value={industry}
        options={[...INDUSTRY]}
        onValueChange={onIndustryChange}
        className="p-0!"
        hasScrollBar
      />
      <Dropdown
        label="Style"
        value={style}
        options={[...STYLE]}
        onValueChange={onStyleChange}
        className="p-0!"
        hasScrollBar
      />
      <Dropdown
        label="Type"
        value={type}
        options={[...TYPE]}
        onValueChange={onTypeChange}
        className="p-0!"
      />
    </div>
  );
}
