import type { AiToolRichText } from "@/libs/sanity/sanity.types";

/**
 * Normalizes `aiToolRichText` so render code can safely access `prefix/main/suffix`
 * without checking for `undefined`.
 */
export function normalizeAiToolRichText(
  value: AiToolRichText | null | undefined
): AiToolRichText {
  return {
    _type: "aiToolRichText",
    main: value?.main ?? "",
    prefix: value?.prefix ?? "",
    suffix: value?.suffix ?? "",
  };
}
