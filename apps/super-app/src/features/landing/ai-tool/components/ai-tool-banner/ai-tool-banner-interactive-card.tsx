"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import type { EAIART_STYLE } from "@/core/models/chat-features/image-creation";
import type { TAIArtOptions } from "@/core/ports/chat-features/image-creation";

import type { AiToolBannerContentStyle } from "../../types/types";
import { BANNER_ART_STYLE_MODEL } from "../../utils";
import type { AiToolBannerPromptSnippetItem } from "../../utils";
import { AIToolBannerPromptSection } from "./ai-tool-banner-prompt-section";
import {
  AIToolBannerQaCardsContent,
  AIToolBannerQaSimpleContent,
} from "./ai-tool-banner-qa-content";
import { AIToolBannerTranslateContent } from "./ai-tool-banner-translate-content";
import type { AIToolBannerUploadFileLabels } from "./ai-tool-banner-upload-file-content";
import { AIToolBannerUploadFileContent } from "./ai-tool-banner-upload-file-content";
import { useAiToolBannerGenerate } from "./use-ai-tool-banner-generate";
import { useAiToolBannerModelSelection } from "./use-ai-tool-banner-model-selection";
import { useAiToolBannerRedirect } from "./use-ai-tool-banner-redirect";

import styles from "./styles.module.css";

const AIToolArtStyleChooser = dynamic(
  async () => {
    const m = await import("./ai-tool-art-style-chooser");
    return m.AIToolArtStyleChooser;
  },
  {
    loading: () => <ArtStyleChooserLoadingFallback />,
    ssr: true,
  }
);

function ArtStyleChooserLoadingFallback() {
  return (
    <div className={styles.artStyleRoot} aria-busy="true">
      <div className={styles.artStyleLoadingHeader} />
      <div className={styles.artStyleLoadingRow}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} className={styles.artStyleLoadingChip} />
        ))}
      </div>
    </div>
  );
}

interface Props {
  /** Sanity `banner.redirectLink` (e.g. `/conversation?model=gpt-4o`) — locale is prepended on Generate. */
  redirectLink?: string;
  contentStyle: AiToolBannerContentStyle;
  /** When false, hides the model selector and uses redirectLink as-is without appending a model param. */
  allowSelectModel?: boolean;
  isAllowArtStyleChosen: boolean;
  initialArtOptions: TAIArtOptions[];
  initialSelectedArtStyle: EAIART_STYLE;
  generateAriaLabel: string;
  placeholder: string;
  generateLabel: string;
  actionLabel: string;
  tryTheseLabel: string;
  tryTheseOptionalHint: string;
  promptSnippets: AiToolBannerPromptSnippetItem[];
  uploadFileLabels: AIToolBannerUploadFileLabels;
}

export function AIToolBannerInteractiveCard({
  redirectLink,
  contentStyle,
  allowSelectModel = true,
  isAllowArtStyleChosen,
  initialArtOptions,
  initialSelectedArtStyle,
  generateAriaLabel,
  placeholder,
  generateLabel,
  actionLabel,
  tryTheseLabel,
  tryTheseOptionalHint,
  promptSnippets,
  uploadFileLabels,
}: Props) {
  const [selectedArtStyle, setSelectedArtStyle] = useState<EAIART_STYLE>(
    initialSelectedArtStyle
  );
  const [prompt, setPrompt] = useState("");
  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(null);

  const { models, selectedModel, seenChatModels, handleSelectModel } =
    useAiToolBannerModelSelection();

  const modelSelectorProps = useMemo(
    () => ({
      models,
      onModelSelect: handleSelectModel,
      seenModels: seenChatModels,
      selectedModel,
    }),
    [handleSelectModel, models, seenChatModels, selectedModel]
  );

  const onGenerate = useAiToolBannerGenerate({
    allowSelectModel,
    contentStyle,
    isAllowArtStyleChosen,
    prompt,
    redirectLink,
    selectedArtStyle,
    selectedModelValue: selectedModel.value,
  });

  const onChooseFiles = useAiToolBannerRedirect({ redirectLink });

  return (
    <div
      className={`${styles.card} ${contentStyle === "qa-cards" ? styles.cardWide : ""}`}
    >
      {contentStyle === "default" ? (
        <>
          {isAllowArtStyleChosen ? (
            <AIToolArtStyleChooser
              initialOptions={initialArtOptions}
              modelValue={BANNER_ART_STYLE_MODEL}
              selectedValue={selectedArtStyle}
              onSelectedValueChange={setSelectedArtStyle}
              trackingSection="banner"
            />
          ) : null}

          <AIToolBannerPromptSection
            generateAriaLabel={generateAriaLabel}
            placeholder={placeholder}
            generateLabel={generateLabel}
            promptSnippets={promptSnippets}
            prompt={prompt}
            onPromptChange={setPrompt}
            onGenerate={onGenerate}
          />
        </>
      ) : null}

      {contentStyle === "translate" ? (
        <AIToolBannerTranslateContent
          generateAriaLabel={generateAriaLabel}
          placeholder={placeholder}
          actionLabel={actionLabel}
          tryTheseLabel={tryTheseLabel}
          tryTheseOptionalHint={tryTheseOptionalHint}
          modelSelector={allowSelectModel ? modelSelectorProps : undefined}
          promptSnippets={promptSnippets}
          prompt={prompt}
          onPromptChange={setPrompt}
          onActiveSnippetChange={setActiveSnippetId}
          onGenerate={onGenerate}
        />
      ) : null}

      {contentStyle === "qa-cards" ? (
        <AIToolBannerQaCardsContent
          generateAriaLabel={generateAriaLabel}
          placeholder={placeholder}
          actionLabel={actionLabel}
          modelSelector={allowSelectModel ? modelSelectorProps : undefined}
          promptSnippets={promptSnippets}
          prompt={prompt}
          onPromptChange={setPrompt}
          activeSnippetId={activeSnippetId}
          onActiveSnippetChange={setActiveSnippetId}
          onGenerate={onGenerate}
          attachAriaLabel={uploadFileLabels.chooseFilesAriaLabel}
        />
      ) : null}

      {contentStyle === "qa-simple" ? (
        <AIToolBannerQaSimpleContent
          generateAriaLabel={generateAriaLabel}
          placeholder={placeholder}
          actionLabel={actionLabel}
          modelSelector={allowSelectModel ? modelSelectorProps : undefined}
          prompt={prompt}
          onPromptChange={setPrompt}
          onGenerate={onGenerate}
        />
      ) : null}

      {contentStyle === "upload-file" ? (
        <AIToolBannerUploadFileContent
          {...uploadFileLabels}
          onChooseFiles={onChooseFiles}
        />
      ) : null}
    </div>
  );
}
