"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import PillIcon from "@/features/suite/assets/icons/pill-icon.svg";
import type { PromptInputMessage } from "@/features/suite/components/ui/ai-elements/prompt-input";
import { PromptInputProvider } from "@/features/suite/components/ui/ai-elements/prompt-input";
import { getStudioUsecases } from "@/features/suite/config/studio-usecases";
import { useSuiteTracking } from "@/features/suite/hooks/use-suite-tracking";
import type { SuiteTool } from "@/features/suite/types/routes";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

import { SuitePromptInput } from "../../../custom/prompt-input/index";

export interface HomePromptingSectionProps {
  // Studio whose use-case chips to render (drives the chip list from config).
  tool: SuiteTool;
  // Chip pre-selected on mount when deep-linked to a use-case (/design-studio/<slug>).
  initialSelectedChipId?: string;
  onSubmitAction: (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>
  ) => void | Promise<void>;
  onUsecaseSelect?: (id: string, label: string) => void;
  onUploadClick?: () => void;
}

export function HomePromptingSection({
  tool,
  initialSelectedChipId,
  onSubmitAction,
  onUsecaseSelect,
  onUploadClick,
}: HomePromptingSectionProps) {
  const usecases = getStudioUsecases(tool);
  const [selectedChipId, setSelectedChipId] = useState<string | null>(
    initialSelectedChipId ?? null
  );
  const selectedChip =
    usecases.find((c) => c.chipId === selectedChipId) ?? null;
  const tracking = useSuiteTracking();

  return (
    <div
      data-testid={DATA_TEST_ID.suite.home.homePromptingSection}
      className="gap-v1-structural-section-standard py-v1-structural-layout-standard flex w-full max-w-3xl flex-col items-center"
    >
      <div className="gap-v1-structural-content-tight px-v1-structural-content-tight flex w-full flex-col">
        <p className="typo-v1-heading-h1 text-v1-text-hierarchy-emphasis self-stretch">
          Let&apos;s bring your idea to design
        </p>
      </div>

      <div className="gap-v1-structural-content-relaxed flex w-full flex-col">
        <PromptInputProvider>
          <SuitePromptInput
            onSubmitAction={onSubmitAction}
            onUploadClick={onUploadClick}
            page="home"
            usecaseChip={
              selectedChip
                ? {
                    icon: selectedChip.icon,
                    iconColorClass: selectedChip.iconColorClass,
                    iconStyle: selectedChip.iconStyle,
                    label: selectedChip.label,
                    onDismiss: () => setSelectedChipId(null),
                  }
                : undefined
            }
            placeholder={[
              "Design a vintage logo for a coffee shop",
              "Create a minimalist logo for a skincare brand",
              "Create a friendly logo for a pet care service",
              "Design a luxury logo for a perfume brand",
              "Create a geometric logo for a fitness app",
            ]}
            textAreaClassName="max-h-31"
          />
        </PromptInputProvider>

        <div className="gap-v1-structural-content-tight flex flex-row flex-wrap self-stretch">
          {usecases
            .filter(({ chipId }) => chipId !== selectedChipId)
            .map(({ chipId, label, icon }) => (
              <button
                key={chipId}
                type="button"
                onClick={() => {
                  // Only unselected chips are rendered as buttons (deselect happens via the chip's
                  // dismiss), so a click here is always a SELECT → track it.
                  if (selectedChipId !== chipId) {
                    tracking.trackChatModeClick();
                  }
                  setSelectedChipId((prev) =>
                    prev === chipId ? null : chipId
                  );
                  onUsecaseSelect?.(chipId, label);
                }}
                className="rounded-v1-large! bg-v1-chip-background-soft hover:bg-v1-surface-overlay-interactive-hover border-v1-chip-border-subtle thickness-v1-strong overflow-hidden border-solid"
              >
                <div className="gap-v1-structural-content-micro py-v1-structural-component-micro ps-v1-structural-content-relaxed pe-v1-structural-content-tight flex items-center overflow-hidden">
                  <div className="flex size-6 items-center justify-center">
                    {icon}
                  </div>
                  <span className="typo-v1-action-md-light text-v1-text-hierarchy-primary px-v1-structural-content-micro capitalize">
                    {label}
                  </span>
                  <PillIcon className="text-v1-icons-hierarchy-tertiary size-1 shrink-0" />
                  <span className="typo-v1-action-md-light text-v1-text-hierarchy-secondary px-v1-structural-content-micro capitalize">
                    High-Quality Design
                  </span>
                  <span className="rounded-v1-pill bg-v1-badge-new-background text-v1-badge-new-text px-v1-optical-normal py-v1-structural-content-micro typo-v1-label-compact-allcap uppercase">
                    New
                  </span>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
