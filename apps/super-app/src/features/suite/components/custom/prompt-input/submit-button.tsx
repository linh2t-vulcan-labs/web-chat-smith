"use client";

import ArrowUpIcon from "@/features/suite/assets/icons/arrow-up-icon.svg";
// import StopIcon from "@/features/suite/assets/icons/stop-icon.svg";
import {
  PromptInputSubmit,
  usePromptInputController,
} from "@/features/suite/components/ui/ai-elements/prompt-input";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

interface SubmitButtonProps {
  isStreaming?: boolean;
  onStop?: () => void;
  isSubmitEnabled?: boolean;
  // Hard-disable submit regardless of text/upload state (e.g. image quota reached).
  isDisabled?: boolean;
}

export function SubmitButton({
  isStreaming,
  onStop: _onStop,
  isSubmitEnabled,
  isDisabled,
}: SubmitButtonProps) {
  const controller = usePromptInputController();
  const hasText = controller.textInput.value.trim().length > 0;
  const canSubmit = isSubmitEnabled ?? hasText;
  const isUploading = controller.attachments.files.some(
    (f) => f.uploadStatus === "uploading"
  );
  const hasFailed = controller.attachments.files.some(
    (f) => f.uploadStatus === "failed"
  );

  // Note: phase 2 will re-enable stop button during streaming
  // disabled={!isStreaming && (!canSubmit || isUploading || hasFailed)}
  // onClick={isStreaming && onStop ? (e) => { e.preventDefault(); onStop(); } : undefined}
  // type={isStreaming ? "button" : "submit"}
  // {isStreaming ? <StopIcon className="size-2.5" /> : <ArrowUpIcon className="size-2.5" />}
  return (
    <PromptInputSubmit
      data-testid={DATA_TEST_ID.suite.custom.submitButton}
      className="rounded-v1-circle! bg-v1-action-background-primary p-v1-structural-component-micro size-9 overflow-hidden disabled:cursor-not-allowed disabled:opacity-40"
      disabled={
        isDisabled || isStreaming || !canSubmit || isUploading || hasFailed
      }
      type="submit"
    >
      <ArrowUpIcon className="text-v1-action-icon-primary size-2.5" />
    </PromptInputSubmit>
  );
}
