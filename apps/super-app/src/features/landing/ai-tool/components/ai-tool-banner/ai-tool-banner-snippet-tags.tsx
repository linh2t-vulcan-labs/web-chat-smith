"use client";

import type { AiToolBannerPromptSnippetItem } from "../../utils";

import styles from "./styles.module.css";

interface Props {
  promptSnippets: AiToolBannerPromptSnippetItem[];
  onSnippetClick: (snippet: AiToolBannerPromptSnippetItem) => void;
  /** Default centers chips under the prompt row; translate aligns left under the section header. */
  align?: "center" | "start";
}

/** Prompt snippet chips — shared tag button style; list layout varies by `align`. */
export function AIToolBannerSnippetTags({
  promptSnippets,
  onSnippetClick,
  align = "center",
}: Props) {
  if (promptSnippets.length === 0) {
    return null;
  }

  const listClassName = align === "start" ? styles.tagsStart : styles.tags;

  return (
    <ul className={listClassName}>
      {promptSnippets.map((snippet) => (
        <li key={snippet.id}>
          <button
            type="button"
            className={styles.tag}
            onClick={() => onSnippetClick(snippet)}
          >
            {snippet.quickTag}
          </button>
        </li>
      ))}
    </ul>
  );
}
