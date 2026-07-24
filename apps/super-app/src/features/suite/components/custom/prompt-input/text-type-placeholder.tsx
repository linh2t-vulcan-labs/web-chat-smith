"use client";

import { usePromptInputController } from "@/features/suite/components/ui/ai-elements/prompt-input";
import TextType from "@/features/suite/components/ui/text-type";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";

export function PromptInputTextTypePlaceholder({
  placeholder,
}: {
  placeholder: string | string[];
}) {
  const controller = usePromptInputController();
  if (controller.textInput.value.length > 0) {
    return null;
  }
  return (
    <div
      aria-hidden
      data-testid={DATA_TEST_ID.suite.custom.promptInputTextTypePlaceholder}
      className="start-v1-structural-component-medium top-v1-structural-component-medium pointer-events-none absolute z-10"
    >
      <TextType
        className="typo-v1-body-default-normal font-250 text-v1-text-hierarchy-placeholder opacity-60"
        loop
        cursorCharacter=""
        pauseDuration={1200}
        text={placeholder}
        typingSpeed={80}
        deletingSpeed={30}
        variableSpeed={undefined}
        onSentenceComplete={undefined}
      />
    </div>
  );
}
