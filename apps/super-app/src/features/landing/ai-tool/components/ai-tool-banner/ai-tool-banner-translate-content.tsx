"use client";

import { useCallback, useMemo, useRef } from "react";

import ArrowLeftRightIcon from "@/public/icons/landing-page/arrow-left-right.svg?react";

import { useFeaturePageTracking } from "../../tracking/use-feature-page-tracking";
import type { AiToolBannerPromptSnippetItem } from "../../utils";
import type { AIToolBannerModelSelectorProps } from "./ai-tool-banner-model-selector";
import { AIToolBannerModelSelector } from "./ai-tool-banner-model-selector";
import {
  AIToolBannerActionButton,
  AIToolBannerPromptForm,
} from "./ai-tool-banner-shared";
import { AIToolBannerSnippetTags } from "./ai-tool-banner-snippet-tags";

import styles from "./styles.module.css";

const TRANSLATE_CHAR_LIMIT = 200;

interface TranslateProps {
  generateAriaLabel: string;
  placeholder: string;
  actionLabel: string;
  tryTheseLabel: string;
  tryTheseOptionalHint: string;
  modelSelector?: AIToolBannerModelSelectorProps;
  promptSnippets: AiToolBannerPromptSnippetItem[];
  prompt: string;
  onPromptChange: (value: string) => void;
  onActiveSnippetChange: (id: string | null) => void;
  onGenerate: () => void;
}

export function AIToolBannerTranslateContent({
  generateAriaLabel,
  placeholder,
  actionLabel,
  tryTheseLabel,
  tryTheseOptionalHint,
  modelSelector,
  promptSnippets,
  prompt,
  onPromptChange,
  onActiveSnippetChange,
  onGenerate,
}: TranslateProps) {
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const { trackClickHashtag } = useFeaturePageTracking();
  const textSnippets = useMemo(
    () => promptSnippets.filter((snippet) => snippet.kind === "text"),
    [promptSnippets]
  );

  const applySnippet = useCallback(
    (snippet: AiToolBannerPromptSnippetItem) => {
      trackClickHashtag();
      const text = snippet.fullPrompt || snippet.quickTag;
      const withNewline = text.endsWith("\n") ? text : `${text}\n`;
      onPromptChange(withNewline.slice(0, TRANSLATE_CHAR_LIMIT));
      onActiveSnippetChange(snippet.id);
      queueMicrotask(() => promptInputRef.current?.focus());
    },
    [onActiveSnippetChange, onPromptChange, trackClickHashtag]
  );

  const handlePromptChange = useCallback(
    (value: string) => {
      onPromptChange(value.slice(0, TRANSLATE_CHAR_LIMIT));
      onActiveSnippetChange(null);
    },
    [onActiveSnippetChange, onPromptChange]
  );

  return (
    <div className={styles.translateFrame}>
      {textSnippets.length > 0 ? (
        <div className={styles.artStyleRoot}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.cardHeaderLabel}>{tryTheseLabel}</span>
              <span className={styles.cardHeaderLabelHint}>
                {" "}
                {tryTheseOptionalHint}
              </span>
            </div>
          </div>
          <AIToolBannerSnippetTags
            promptSnippets={textSnippets}
            onSnippetClick={applySnippet}
            align="start"
          />
        </div>
      ) : null}

      <AIToolBannerPromptForm
        formId="ai-tool-banner-prompt"
        className={styles.translateForm}
        onSubmit={onGenerate}
      >
        <div className={styles.translatePanels}>
          <div className={styles.translatePanel}>
            <textarea
              ref={promptInputRef}
              className={styles.translateTextarea}
              name="prompt"
              placeholder={placeholder}
              autoComplete="off"
              value={prompt}
              rows={3}
              onChange={(e) => handlePromptChange(e.target.value)}
            />
            <div className={styles.translatePanelFooter}>
              <span className={styles.translateCharCount}>
                {prompt.length}/{TRANSLATE_CHAR_LIMIT}
              </span>
              <div className={styles.translateControls}>
                {modelSelector ? (
                  <AIToolBannerModelSelector {...modelSelector} />
                ) : null}
                <AIToolBannerActionButton
                  label={actionLabel}
                  ariaLabel={generateAriaLabel}
                  className={`${styles.bannerActionBtn} ${styles.translateActionBtn}`}
                  onClick={onGenerate}
                />
              </div>
            </div>
          </div>

          <div className={styles.translateSwap} aria-hidden>
            <ArrowLeftRightIcon
              width={24}
              height={24}
              className={styles.translateSwapIcon}
              aria-hidden
              focusable={false}
            />
          </div>

          <div className={styles.translatePanelOutput} aria-hidden>
            <div className={styles.translateOutputPlaceholder} />
          </div>
        </div>
      </AIToolBannerPromptForm>
    </div>
  );
}
