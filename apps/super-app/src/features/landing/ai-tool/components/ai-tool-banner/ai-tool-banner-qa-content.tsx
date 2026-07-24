"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import ClipartIcon from "@/features/suite/assets/icons/clipart-icon.svg";
import CloseIcon from "@/public/icons/landing-page/close.svg?react";

import { useFeaturePageTracking } from "../../tracking/use-feature-page-tracking";
import type { AiToolBannerPromptSnippetItem } from "../../utils";
import type { AIToolBannerModelSelectorProps } from "./ai-tool-banner-model-selector";
import { AIToolBannerModelSelector } from "./ai-tool-banner-model-selector";
import {
  AIToolBannerActionButton,
  AIToolBannerPromptForm,
} from "./ai-tool-banner-shared";

import styles from "./styles.module.css";

const QA_CARD_FILE_ACCEPT =
  "image/png,image/jpeg,image/jpg,application/pdf,.pdf";

function renderQaSnippetMedia(snippet: AiToolBannerPromptSnippetItem) {
  if (snippet.kind === "image" && snippet.imagePromptUrl) {
    return (
      <span className={styles.qaCardMedia}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={snippet.imagePromptUrl}
          alt={snippet.imagePromptAlt ?? snippet.quickTag}
          className={styles.qaCardImage}
        />
      </span>
    );
  }

  if (snippet.fullPrompt) {
    return <span className={styles.qaCardBody}>{snippet.fullPrompt}</span>;
  }

  return null;
}

interface QaCardSelectedAttachment {
  id: string;
  label: string;
  previewUrl: string;
  snippetId?: string;
  source: "snippet" | "file";
  file?: File;
}

interface QaSimpleProps {
  generateAriaLabel: string;
  placeholder: string;
  actionLabel: string;
  modelSelector?: AIToolBannerModelSelectorProps;
  prompt: string;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
}

export function AIToolBannerQaSimpleContent({
  generateAriaLabel,
  placeholder,
  actionLabel,
  modelSelector,
  prompt,
  onPromptChange,
  onGenerate,
}: QaSimpleProps) {
  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className={styles.qaSimpleRoot}>
      <AIToolBannerPromptForm
        formId="ai-tool-banner-prompt"
        className={styles.qaSimpleForm}
        onSubmit={onGenerate}
      >
        <div className={styles.qaSimplePanel}>
          <textarea
            ref={promptInputRef}
            className={styles.qaSimpleTextarea}
            name="prompt"
            placeholder={placeholder}
            autoComplete="off"
            value={prompt}
            rows={3}
            onChange={(e) => onPromptChange(e.target.value)}
          />
          <div className={styles.qaSimpleFooter}>
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
      </AIToolBannerPromptForm>
    </div>
  );
}

type QaCardsProps = QaSimpleProps & {
  promptSnippets: AiToolBannerPromptSnippetItem[];
  activeSnippetId: string | null;
  onActiveSnippetChange: (id: string | null) => void;
  attachAriaLabel: string;
};

function createFileAttachmentId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `file-${crypto.randomUUID()}`;
  }
  return `file-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AIToolBannerQaCardsContent({
  generateAriaLabel,
  placeholder,
  actionLabel,
  modelSelector,
  promptSnippets,
  prompt,
  onPromptChange,
  activeSnippetId,
  onActiveSnippetChange,
  onGenerate,
  attachAriaLabel,
}: QaCardsProps) {
  const t = useTranslations("ai_tool.banner.qaCards");
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { trackClickHashtag } = useFeaturePageTracking();
  const [selectedAttachments, setSelectedAttachments] = useState<
    QaCardSelectedAttachment[]
  >([]);
  const selectedAttachmentsRef = useRef(selectedAttachments);
  // oxlint-disable-next-line react/react-compiler -- intentional latest-value ref updated during render so the unmount cleanup effect below can revoke the current blob URLs without re-registering
  selectedAttachmentsRef.current = selectedAttachments;

  useEffect(
    () => () => {
      for (const item of selectedAttachmentsRef.current) {
        if (item.source === "file" && item.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.previewUrl);
        }
      }
    },
    []
  );

  const removeAttachment = useCallback((attachmentId: string) => {
    setSelectedAttachments((prev) => {
      const target = prev.find((item) => item.id === attachmentId);
      if (target?.source === "file" && target.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((item) => item.id !== attachmentId);
    });
  }, []);

  const isSnippetSelected = useCallback(
    (snippet: AiToolBannerPromptSnippetItem) => {
      if (snippet.kind === "image") {
        return selectedAttachments.some(
          (item) => item.snippetId === snippet.id
        );
      }
      return activeSnippetId === snippet.id;
    },
    [activeSnippetId, selectedAttachments]
  );

  const handleSnippetClick = useCallback(
    (snippet: AiToolBannerPromptSnippetItem) => {
      trackClickHashtag();

      if (snippet.kind === "image" && snippet.imagePromptUrl) {
        const attachmentId = `snippet-${snippet.id}`;
        setSelectedAttachments((prev) => {
          if (prev.some((item) => item.id === attachmentId)) {
            return prev;
          }
          return [
            ...prev,
            {
              id: attachmentId,
              label: snippet.imagePromptAlt ?? snippet.quickTag,
              previewUrl: snippet.imagePromptUrl as string,
              snippetId: snippet.id,
              source: "snippet",
            },
          ];
        });
        onActiveSnippetChange(null);

        const imagePromptText = snippet.fullPrompt?.trim();
        if (imagePromptText) {
          onPromptChange(imagePromptText);
          queueMicrotask(() => promptInputRef.current?.focus());
        }
        return;
      }

      if (activeSnippetId === snippet.id) {
        onActiveSnippetChange(null);
        return;
      }

      const text = snippet.fullPrompt || snippet.quickTag;
      onPromptChange(text);
      onActiveSnippetChange(snippet.id);
      queueMicrotask(() => promptInputRef.current?.focus());
    },
    [activeSnippetId, onActiveSnippetChange, onPromptChange, trackClickHashtag]
  );

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = [...(event.target.files ?? [])];
      if (!files.length) {
        return;
      }

      setSelectedAttachments((prev) => [
        ...prev,
        ...files.map((file) => ({
          file,
          id: createFileAttachmentId(),
          label: file.name,
          previewUrl: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : "",
          source: "file" as const,
        })),
      ]);

      event.target.value = "";
    },
    []
  );

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handlePromptChange = useCallback(
    (value: string) => {
      onPromptChange(value);
      if (value.trim()) {
        onActiveSnippetChange(null);
      }
    },
    [onActiveSnippetChange, onPromptChange]
  );

  return (
    <div className={styles.qaCardsRoot}>
      <AIToolBannerPromptForm
        formId="ai-tool-banner-prompt"
        className={styles.qaCardsForm}
        onSubmit={onGenerate}
      >
        <div className={styles.qaCardsPanel}>
          <input
            ref={fileInputRef}
            type="file"
            className={styles.qaCardsFileInput}
            accept={QA_CARD_FILE_ACCEPT}
            multiple
            onChange={handleFileChange}
            aria-hidden
            tabIndex={-1}
          />

          {selectedAttachments.length > 0 ? (
            <ul
              className={styles.qaCardsSelectedRow}
              aria-label={t("selectedAttachments")}
            >
              {selectedAttachments.map((attachment) => (
                <li key={attachment.id} className={styles.qaCardsSelectedItem}>
                  <button
                    type="button"
                    className={styles.qaCardsSelectedRemove}
                    onClick={() => removeAttachment(attachment.id)}
                    aria-label={t("removeAttachment", {
                      name: attachment.label,
                    })}
                  >
                    <CloseIcon
                      className={styles.qaCardsSelectedRemoveIcon}
                      aria-hidden
                      focusable={false}
                    />
                  </button>
                  {attachment.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={attachment.previewUrl}
                      alt={attachment.label}
                      className={styles.qaCardsSelectedImage}
                    />
                  ) : (
                    <span className={styles.qaCardsSelectedFileBadge}>
                      {attachment.label.split(".").pop()?.toUpperCase() ??
                        "FILE"}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          <textarea
            ref={promptInputRef}
            className={styles.qaCardsTextarea}
            name="prompt"
            placeholder={placeholder}
            autoComplete="off"
            value={prompt}
            rows={3}
            onChange={(e) => handlePromptChange(e.target.value)}
          />

          <div className={styles.qaCardsFooter}>
            <button
              type="button"
              className={styles.qaAttachBtn}
              onClick={handleAttachClick}
              aria-label={attachAriaLabel}
            >
              <ClipartIcon
                className={styles.qaAttachIcon}
                aria-hidden
                focusable={false}
              />
            </button>

            <div className={styles.qaSimpleFooter}>
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
        </div>
      </AIToolBannerPromptForm>

      {promptSnippets.length > 0 ? (
        <ul className={styles.qaCardsList}>
          {promptSnippets.map((snippet) => (
            <li key={snippet.id}>
              <button
                type="button"
                className={`${styles.qaCard} ${styles.qaCardSnippet} ${
                  isSnippetSelected(snippet) ? styles.qaCardActive : ""
                }`}
                onClick={() => handleSnippetClick(snippet)}
              >
                <span className={styles.qaCardTitle}>{snippet.quickTag}</span>
                {renderQaSnippetMedia(snippet)}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
