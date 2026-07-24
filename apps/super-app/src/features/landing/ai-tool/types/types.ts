import type {
  AiTool,
  AiToolBanner,
  AiToolPromptSnippet,
  AiToolSectionByLocale,
  AiToolSectionSchema,
  AiToolTitleByLocale,
} from "@/libs/sanity/sanity.types";

import type { AiToolGroupSegment } from "../constants/groups";
import type { AIToolLocale } from "../translations/config";

/** One dereferenced link row under an AI tool category (`aiToolCategory.links[]`). */
export interface AIToolHeaderCategoryLinkRow {
  _key: string;
  link: {
    _id: string;
    url?: string;
    linkTitleByLocale?: AiToolTitleByLocale;
  };
}

/** Resolved `aiToolCategory` nested under `AIToolHeaderCategoryRow`. */
export interface AIToolHeaderResolvedCategory {
  _id: string;
  categoryTitleByLocale?: AiToolTitleByLocale;
  links?: AIToolHeaderCategoryLinkRow[];
}

/** One row in `categories[]` / `extra_categories[]` after GROQ dereferencing from the `header` document. */
export interface AIToolHeaderCategoryRow {
  _key: string;
  category: AIToolHeaderResolvedCategory;
}

/** One `banner.promptSnippets[]` row after GROQ dereferences `aiSnippetSet` (all locale fields). */
export type AiToolBannerPromptSnippetRow = {
  _key: string;
  _id?: string;
  _type?: "aiSnippetSet";
} & Partial<Record<AIToolLocale, AiToolPromptSnippet | undefined>>;

/** `AiToolBanner` with expanded `promptSnippets` from `AI_TOOL_PAGE_QUERY`. */
export type AiToolBannerDocument = Omit<AiToolBanner, "promptSnippets"> & {
  promptSnippets?: AiToolBannerPromptSnippetRow[];
};

export type AiToolBannerContentStyle = NonNullable<
  AiToolBanner["contentStyle"]
>;

/** One `sections[]` row after GROQ dereferences `aiToolSectionSchema` (all locale fields). */
export type AiToolSectionSchemaRow = {
  _key: string;
} & AiToolSectionSchema;

/**
 * Section payload for existing section components: `sectionType` + locale-resolved
 * `richText` / `subTitle` / `items` merged onto the schema document.
 */
export type AiToolSectionResolved = Pick<
  AiToolSectionSchema,
  "_id" | "_type" | "_createdAt" | "_updatedAt" | "_rev" | "name"
> & {
  _key: string;
  sectionType: NonNullable<AiToolSectionSchema["sectionType"]>;
  richText: AiToolSectionByLocale["richText"];
  subTitle?: string;
  items?: AiToolSectionByLocale["items"];
};

/** Route context for section CTAs (conversation redirect by group / slug). */
export interface AIToolSectionPageContext {
  group: AiToolGroupSegment;
  slug: string;
  /** CMS `banner.redirectLink` — sections use this as CTA href when set. */
  redirectLink?: string;
}

/** `data` prop for metric / hero / feature / step section components. */
export interface AIToolSectionComponentProps {
  data: AiToolSectionResolved | null | undefined;
}

/** Sections with a CTA that redirects using the current page `group` / `slug`. */
export type AIToolSectionWithCtaProps = AIToolSectionComponentProps & {
  page: AIToolSectionPageContext;
};

/** `linkAiTool` on the current `aiTool` page — heading + which groups to list. */
export type MoreResourceAiTool = NonNullable<AiTool["linkAiTool"]>;
