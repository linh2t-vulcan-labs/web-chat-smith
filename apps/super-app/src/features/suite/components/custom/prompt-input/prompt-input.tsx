"use client";

import {
  PromptInput,
  PromptInputBody,
  PromptInputFooter,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputController,
} from "@/features/suite/components/ui/ai-elements/prompt-input";
import { useSuiteTracking } from "@/features/suite/hooks/use-suite-tracking";
import { cn } from "@/features/suite/utils/classnames";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

import type { PromptInputUploadDialogProps } from "../upload-dialog/index";
import { PromptInputUploadDialog } from "../upload-dialog/index";
import { PromptInputAttachmentsPreview } from "./attachments-preview";
import {
  PROMPT_INPUT_COUNTER_VISIBLE_FROM,
  PROMPT_INPUT_MAX_CHARACTERS,
  PromptInputCharacterCounter,
} from "./character-counter";
import { PromptingInputLogoHeader } from "./logo-header";
import { SubmitButton } from "./submit-button";
import { PromptInputTextTypePlaceholder } from "./text-type-placeholder";
import type { SuitePromptInputProps } from "./types";
import { useSuitePromptInput } from "./use-suite-prompt-input";
import { PromptInputUsecaseChip } from "./usecase-chip";

export type {
  PromptingInputLogoHeaderProps,
  SuitePromptInputProps,
  UsecaseChipData,
} from "./types";

const DEFAULT_PLACEHOLDER = [
  "Design a vintage logo for a coffee shop",
  "Create a minimalist logo for a skincare brand",
  "Create a friendly logo for a pet care service",
  "Design a luxury logo for a perfume brand",
  "Create a geometric logo for a fitness app",
];

const DEFAULT_UPLOAD_DIALOG_PROPS: PromptInputUploadDialogProps = {
  closeAriaLabel: "Close upload dialog",
  dropzoneDescription:
    "Max 3 images per message. Max size: 20 MB per file. Format: png, jpg, jpeg.",
  dropzoneTitle: "Drag & Drop or Choose files to upload",
  getRemoveFileAriaLabel: (filename) => `Remove ${filename}`,
  recentFilesTitle: "Recent Files",
  title: "Upload Files",
  triggerAriaLabel: "Attach files",
  untitledFileLabel: "Untitled file",
};

export function SuitePromptInput({
  onSubmitAction,
  placeholder = DEFAULT_PLACEHOLDER,
  showTypingPlaceholder = true,
  className,
  textAreaClassName,
  usecaseChip,
  uploadDialogProps = DEFAULT_UPLOAD_DIALOG_PROPS,
  isStreaming,
  onStop,
  onUploadClick,
  isSubmitDisabled,
  ...promptInputProps
}: SuitePromptInputProps) {
  const suitePromptInput = useSuitePromptInput({
    hasUsecaseChip: Boolean(usecaseChip),
  });
  const controller = usePromptInputController();
  const tracking = useSuiteTracking();
  // Canvas attachments (add-to-chat / annotation) and uploads share one message and the
  // uploads ride along as reference_upload_ids, so the cap is purely the total file count.
  // The upload trigger only locks once all 3 slots are taken.
  const maxFiles = 3;
  const uploadDisabled = controller.attachments.files.length >= maxFiles;

  // Realtime character count from the controller (re-renders on every keystroke).
  const charCount = controller.textInput.value.length;
  const showCharacterCounter = charCount >= PROMPT_INPUT_COUNTER_VISIBLE_FROM;
  const isOverCharacterLimit = charCount > PROMPT_INPUT_MAX_CHARACTERS;
  // Submit is blocked by an external flag (e.g. quota) OR by exceeding the character limit.
  const submitBlocked = Boolean(isSubmitDisabled) || isOverCharacterLimit;

  const handleBrandNameChange = suitePromptInput.setBrandName;
  const handleIndustryChange = suitePromptInput.setIndustry;
  const handleStyleChange = suitePromptInput.setStyle;
  const handleTypeChange = suitePromptInput.setType;

  return (
    <SuitePromptInputRoot className={className}>
      <PromptInputAttachmentsPreview />

      <SuitePromptInputSurface>
        {usecaseChip && (
          <PromptingInputLogoHeader
            brandName={suitePromptInput.brandName}
            onBrandNameChange={handleBrandNameChange}
            industry={suitePromptInput.industry}
            onIndustryChange={handleIndustryChange}
            style={suitePromptInput.style}
            onStyleChange={handleStyleChange}
            type={suitePromptInput.type}
            onTypeChange={handleTypeChange}
          />
        )}

        <PromptInput
          accept="image/png,image/jpeg,image/jpg"
          className="w-full"
          maxFiles={maxFiles}
          maxFileSize={20 * 1024 * 1024}
          multiple
          onSubmit={(msg, e) => {
            if (isStreaming || submitBlocked) {
              return;
            }
            tracking.trackChatSend();
            return onSubmitAction(suitePromptInput.getSubmitMessage(msg), e);
          }}
          onError={suitePromptInput.handleError}
          {...promptInputProps}
        >
          <PromptInputBody className="relative">
            {showTypingPlaceholder && (
              <PromptInputTextTypePlaceholder placeholder={placeholder} />
            )}
            <PromptInputTextarea
              className={cn(
                "px-v1-structural-component-medium placeholder:text-v1-text-hierarchy-placeholder max-h-30 min-h-8 overflow-y-auto",
                // When the counter is visible it sits directly below, so drop the textarea's bottom padding.
                showCharacterCounter
                  ? "pt-v1-structural-component-medium pb-0"
                  : "py-v1-structural-component-medium",
                textAreaClassName
              )}
              placeholder={showTypingPlaceholder ? "" : (placeholder as string)}
              autoFocus
              onKeyDown={(e) => {
                if (
                  (isStreaming || submitBlocked) &&
                  e.key === "Enter" &&
                  !e.shiftKey
                ) {
                  e.preventDefault();
                }
              }}
            />
          </PromptInputBody>

          {showCharacterCounter && (
            <PromptInputCharacterCounter count={charCount} />
          )}

          <PromptInputFooter className="p-v1-structural-component-micro">
            <PromptInputTools className="gap-v1-optical-subtle">
              <PromptInputUploadDialog
                {...uploadDialogProps}
                disabled={uploadDisabled}
                onTriggerClick={onUploadClick}
              />
              {usecaseChip && <PromptInputUsecaseChip {...usecaseChip} />}
            </PromptInputTools>

            <PromptInputTools className="gap-v1-structural-component-micro">
              <SubmitButton
                isStreaming={isStreaming}
                isSubmitEnabled={
                  usecaseChip
                    ? suitePromptInput.hasAnyLogoField || undefined
                    : undefined
                }
                isDisabled={submitBlocked}
                onStop={onStop}
              />
            </PromptInputTools>
          </PromptInputFooter>
        </PromptInput>
      </SuitePromptInputSurface>
    </SuitePromptInputRoot>
  );
}

function SuitePromptInputRoot({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-testid={DATA_TEST_ID.suite.custom.suitePromptInput}
      className={cn(
        "gap-v1-structural-component-none rounded-v1-xl relative flex flex-col overflow-hidden",
        "bg-v1-surface-input-base px-v1-structural-content-micro py-v1-structural-content-micro backdrop-blur-(--spacing-v1-effect-glass-24)",
        className
      )}
    >
      <div
        aria-hidden
        className="bg-v1-surface-conversation-user-material pointer-events-none absolute inset-0"
      />
      {children}
    </div>
  );
}

function SuitePromptInputSurface({ children }: { children: React.ReactNode }) {
  return (
    <div className="gap-v1-optical-subtle rounded-v1-large bg-v1-form-background-default relative z-10 flex flex-col backdrop-blur-(--spacing-v1-effect-glass-16)">
      {children}
    </div>
  );
}
