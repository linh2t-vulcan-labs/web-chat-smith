/**
 * Maps URL segments (`/image/foo`, `/text/bar`) to Sanity `groupId` on `aiTool`.
 * Add a segment here when introducing a new AI tool landing group in Studio.
 */
export const AI_TOOL_GROUPS = {
  code: "ai-tool-code",
  doc: "ai-tool-doc",
  image: "ai-tool-image",
  model: "ai-tool-model",
  study: "ai-tool-study",
  text: "ai-tool-text",
} as const;

export type AiToolGroupSegment = keyof typeof AI_TOOL_GROUPS;
export type AiToolGroupId = (typeof AI_TOOL_GROUPS)[AiToolGroupSegment];

export const AI_TOOL_GROUP_SEGMENTS = Object.keys(
  AI_TOOL_GROUPS
) as AiToolGroupSegment[];

export function isAiToolGroupSegment(
  value: string
): value is AiToolGroupSegment {
  return Object.hasOwn(AI_TOOL_GROUPS, value);
}

export function getGroupIdFromSegment(segment: string): AiToolGroupId | null {
  if (!isAiToolGroupSegment(segment)) {
    return null;
  }
  return AI_TOOL_GROUPS[segment];
}

export function getSegmentFromGroupId(
  groupId: string
): AiToolGroupSegment | null {
  for (const segment of AI_TOOL_GROUP_SEGMENTS) {
    if (AI_TOOL_GROUPS[segment] === groupId) {
      return segment;
    }
  }
  return null;
}

/** Path without locale prefix, e.g. `/image/image-generator`. */
export function buildAiToolPagePath(
  group: AiToolGroupSegment,
  slug: string
): string {
  return `/${group}/${slug}`;
}

/** Path without locale prefix, e.g. `/doc`. */
export function buildAiToolGroupPath(group: AiToolGroupSegment): string {
  return `/${group}`;
}

/** Sanity `aiGroupConfig` document id, e.g. `aiGroupConfig-ai-tool-doc`. */
export function buildAiGroupConfigDocumentId(groupId: AiToolGroupId): string {
  return `aiGroupConfig-${groupId}`;
}
