import { EAIART_STYLE } from "@/core/models/chat-features/image-creation";

import { LOCAL_STORAGE_KEY } from "./keys";

const HANDOFF_VERSION = 2 as const;

interface HandoffPayloadV2 {
  v: typeof HANDOFF_VERSION;
  prompt: string;
  /** Present only when the landing page is `image` and the user picked a style. */
  artStyle?: string;
  /** Chat model value chosen on banner (translate / QA styles). */
  model?: string;
}

export interface WriteAiToolLandingBannerHandoffInput {
  prompt: string;
  /** Include only for `image` group — omitted for text / code / study / model. */
  artStyle?: string;
  /** Selected chat model value from banner model dropdown. */
  model?: string;
}

export interface AiToolLandingBannerHandoff {
  prompt: string;
  /** Raw style key stored by landing page (may come from Remote Config). */
  artStyle?: string;
  model?: string;
}

function parseStoredHandoff(raw: string): AiToolLandingBannerHandoff | null {
  const parsed = JSON.parse(raw) as unknown;
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const rec = parsed as Record<string, unknown>;
  const version = rec.v;
  if (version !== HANDOFF_VERSION && version !== 1) {
    return null;
  }
  if (typeof rec.prompt !== "string") {
    return null;
  }

  const prompt = rec.prompt.trim();
  const artStyle = typeof rec.artStyle === "string" ? rec.artStyle : undefined;
  const model = typeof rec.model === "string" ? rec.model.trim() : undefined;
  const hasArtStyle = Boolean(artStyle && artStyle !== EAIART_STYLE.NONE);

  return {
    prompt,
    ...(hasArtStyle && artStyle ? { artStyle } : {}),
    ...(model ? { model } : {}),
  };
}

/** Persists banner prompt before navigating to conversation; art style only when `artStyle` is passed (image group). */
export function writeAiToolLandingBannerHandoff({
  prompt,
  artStyle,
  model,
}: WriteAiToolLandingBannerHandoffInput): void {
  if (globalThis.window === undefined) {
    return;
  }

  const modelValue = model?.trim();

  const payload: HandoffPayloadV2 = {
    prompt,
    v: HANDOFF_VERSION,
    ...(artStyle !== null &&
    artStyle !== undefined &&
    artStyle !== EAIART_STYLE.NONE
      ? { artStyle }
      : {}),
    ...(modelValue ? { model: modelValue } : {}),
  };

  try {
    globalThis.localStorage.setItem(
      LOCAL_STORAGE_KEY.AI_TOOL_LANDING_IMAGE_GENERATE_HANDOFF,
      JSON.stringify(payload)
    );
  } catch {
    // Quota / private mode — still allow navigation without draft
  }
}

/**
 * Reads one-shot landing banner handoff and removes the storage key.
 * Prompt is always returned when valid; `selectedAIArt` only when image art was stored.
 */
// function readAndClearAiToolLandingBannerHandoff(): AiToolLandingBannerHandoff | null {
//   if (globalThis.window === undefined) {
//     return null;
//   }

//   const key = LOCAL_STORAGE_KEY.AI_TOOL_LANDING_IMAGE_GENERATE_HANDOFF;
//   try {
//     const raw = globalThis.localStorage.getItem(key);
//     if (!raw) {
//       return null;
//     }
//     globalThis.localStorage.removeItem(key);
//     return parseStoredHandoff(raw);
//   } catch {
//     try {
//       globalThis.localStorage.removeItem(key);
//     } catch {
//       /* ignore */
//     }
//     return null;
//   }
// }

/** Read without clearing; caller decides when to clear. */
export function readAiToolLandingBannerHandoff(): AiToolLandingBannerHandoff | null {
  if (globalThis.window === undefined) {
    return null;
  }
  const key = LOCAL_STORAGE_KEY.AI_TOOL_LANDING_IMAGE_GENERATE_HANDOFF;
  try {
    const raw = globalThis.localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    return parseStoredHandoff(raw);
  } catch {
    return null;
  }
}

export function clearAiToolLandingBannerHandoff(): void {
  if (globalThis.window === undefined) {
    return;
  }
  const key = LOCAL_STORAGE_KEY.AI_TOOL_LANDING_IMAGE_GENERATE_HANDOFF;
  try {
    globalThis.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
