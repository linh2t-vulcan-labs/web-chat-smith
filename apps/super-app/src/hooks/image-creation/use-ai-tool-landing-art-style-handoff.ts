import { useEffect, useRef } from "react";

import { EAIART_STYLE } from "@/core/models/chat-features/image-creation";
import { EConversationMode } from "@/core/models/conversation";
import type { TAIArtOptions } from "@/core/ports/chat-features/image-creation";
import {
  clearAiToolLandingBannerHandoff,
  readAiToolLandingBannerHandoff,
} from "@/utils/commons/ai-tool-landing-generate-handoff";

interface UseAiToolLandingArtStyleHandoffInput {
  currentAIArtOptions: TAIArtOptions[];
  modeParams: string | null | undefined;
  setSelectedAIArt: (next: TAIArtOptions) => void;
}

/**
 * Applies landing-page stored art style to `/conversation` only after the real
 * `currentAIArtOptions` list is available, then clears the handoff key.
 */
export function useAiToolLandingArtStyleHandoff({
  currentAIArtOptions,
  modeParams,
  setSelectedAIArt,
}: UseAiToolLandingArtStyleHandoffInput) {
  const processedRef = useRef(false);
  const pendingStyleRef = useRef<string | null>(null);

  useEffect(() => {
    if (modeParams !== EConversationMode.AI_ART) {
      return;
    }
    if (!currentAIArtOptions.length) {
      return;
    }

    // Read & clear localStorage once, then reconcile later without re-reading.
    if (pendingStyleRef.current === null && !processedRef.current) {
      const handoff = readAiToolLandingBannerHandoff();
      const artStyle = handoff?.artStyle?.trim();
      clearAiToolLandingBannerHandoff();

      if (!artStyle || artStyle === EAIART_STYLE.NONE) {
        processedRef.current = true;
        return;
      }

      pendingStyleRef.current = artStyle;
    }

    if (processedRef.current) {
      return;
    }
    const artStyle = pendingStyleRef.current;
    if (!artStyle) {
      return;
    }

    const matched = currentAIArtOptions.find(
      (opt) =>
        opt.value === (artStyle as EAIART_STYLE) && opt.isEnabled !== false
    );

    // If we can't match yet, keep waiting for options to update.
    if (!matched) {
      return;
    }

    setSelectedAIArt(matched);
    processedRef.current = true;
    pendingStyleRef.current = null;
  }, [currentAIArtOptions, modeParams, setSelectedAIArt]);
}
