"use client";

import { useEffect, useRef, useState } from "react";

interface UseCopyToClipboardParams {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
}

interface UseCopyToClipboardResult {
  isCopied: boolean;
  copyToClipboard: (text: string) => Promise<void>;
}

const isClipboardAvailable = (): boolean =>
  typeof window !== "undefined" && Boolean(navigator?.clipboard?.writeText);

/**
 * Copies text to the clipboard and tracks a transient "copied" state that
 * resets after `timeout` ms — the shared primitive behind every copy button
 * in the ai-elements component family (code block, commit, snippet,
 * terminal, ...) so each one doesn't hand-roll the same
 * `navigator.clipboard.writeText` + timeout dance.
 */
export const useCopyToClipboard = ({
  onCopy,
  onError,
  timeout = 2000,
}: UseCopyToClipboardParams = {}): UseCopyToClipboardResult => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number>(0);

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    []
  );

  const copyToClipboard = async (text: string) => {
    if (!isClipboardAvailable()) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      onCopy?.();
      timeoutRef.current = window.setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return { copyToClipboard, isCopied };
};
