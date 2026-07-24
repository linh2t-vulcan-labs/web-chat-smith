"use client";

import { useCallback, useMemo, useRef } from "react";
import type { FormEvent, SVGProps } from "react";

import AiArtIcon from "@/public/icons/landing-page/magic.svg?react";

import { useFeaturePageTracking } from "../../tracking/use-feature-page-tracking";
import type { AiToolBannerPromptSnippetItem } from "../../utils";
import { AIToolBannerSnippetTags } from "./ai-tool-banner-snippet-tags";

import styles from "./styles.module.css";

interface Props {
  generateAriaLabel: string;
  placeholder: string;
  generateLabel: string;
  promptSnippets: AiToolBannerPromptSnippetItem[];
  prompt: string;
  onPromptChange: (value: string) => void;
  /** Send / Generate: parent persists draft + redirects (no loading state). */
  onGenerate?: () => void;
}

function SendPlaneIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
      {...props}
    >
      <path
        d="M2.5 16.25L17.5 10L2.5 3.75L2.5 8.75L13.125 10L2.5 11.25V16.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function AIToolBannerPromptSection({
  generateAriaLabel,
  placeholder,
  generateLabel,
  promptSnippets,
  prompt,
  onPromptChange,
  onGenerate,
}: Props) {
  const promptInputRef = useRef<HTMLInputElement>(null);
  const { trackClickHashtag } = useFeaturePageTracking();
  const textSnippets = useMemo(
    () => promptSnippets.filter((snippet) => snippet.kind === "text"),
    [promptSnippets]
  );

  const performGenerate = useCallback(() => {
    if (!onGenerate) {
      return;
    }
    onGenerate();
  }, [onGenerate]);

  const onSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      performGenerate();
    },
    [performGenerate]
  );

  const onGenerateClick = useCallback(() => {
    performGenerate();
  }, [performGenerate]);

  const applySnippet = useCallback(
    (snippet: AiToolBannerPromptSnippetItem) => {
      trackClickHashtag();
      const text = snippet.fullPrompt || snippet.quickTag;
      onPromptChange(text);
      queueMicrotask(() => promptInputRef.current?.focus());
    },
    [onPromptChange, trackClickHashtag]
  );

  return (
    <div className={styles.promptBlock}>
      <form
        id="ai-tool-banner-prompt"
        className={styles.promptForm}
        action="#"
        method="post"
        onSubmit={onSubmit}
      >
        <div className={styles.promptRow}>
          <span className={styles.promptIcon} aria-hidden="true">
            <AiArtIcon
              width={24}
              height={24}
              className={styles.wandIcon}
              aria-hidden
              focusable={false}
            />
          </span>

          <input
            ref={promptInputRef}
            className={styles.promptInput}
            type="text"
            name="prompt"
            placeholder={placeholder}
            autoComplete="off"
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
          />

          <button
            type="button"
            className={styles.mobileSend}
            aria-label={generateAriaLabel}
            disabled={!onGenerate}
            onClick={onGenerateClick}
          >
            <SendPlaneIcon className={styles.sendIcon} />
          </button>

          <button
            type="button"
            className={styles.desktopGenerate}
            disabled={!onGenerate}
            onClick={onGenerateClick}
          >
            {generateLabel}
            <SendPlaneIcon className={styles.generatePlane} />
          </button>
        </div>
      </form>

      <AIToolBannerSnippetTags
        promptSnippets={textSnippets}
        onSnippetClick={applySnippet}
      />
    </div>
  );
}
