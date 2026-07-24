import { useTranslations } from "next-intl";

import type { TAssistantWritingPromptProps } from "./types";

export default function AssistantWritingPrompt({
  submitRef,
  prompt,
  onChangePrompt,
}: TAssistantWritingPromptProps) {
  const t = useTranslations("assistantWriting.result");
  const placeholder = t("placeholder");
  return (
    <div className="h-full">
      <textarea
        className="text-bodyM-neutral text-text-general-secondary placeholder:text-bodyM-neutral placeholder:text-text-input-placeholder size-full flex-1 resize-none bg-transparent outline-hidden"
        placeholder={placeholder}
        value={prompt}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            submitRef.current?.click();
          }
        }}
        onChange={(e) => onChangePrompt("prompt", e.target.value)}
      />
    </div>
  );
}
