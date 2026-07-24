// import type { SanityImageSource } from "@sanity/image-url";
import type { Metadata } from "next";

import { DEFAULT_LIST_STYLE_OPTIONS } from "@/components/conversation-input/features/image-creation/consts";
import { EAIART_STYLE } from "@/core/models/chat-features/image-creation";
import { EAIValueModel } from "@/core/models/model";
import type { TAIArtOptions } from "@/core/ports/chat-features/image-creation";
import { routing } from "@/i18n/routing";
import { generateMetadataFromAiSeo } from "@/libs/sanity/ai-seo-metadata";
// import { buildSanityImageUrlWithPreset } from "@/libs/sanity/image-url";
import type {
  AiGroupConfigLocaleContent,
  AiSeo,
  AiToolPromptSnippet,
} from "@/libs/sanity/sanity.types";
import { CALLBACK_URL_QUERY_PARAM } from "@/utils/constants/common";

import { buildAiToolGroupPath, buildAiToolPagePath } from "../constants/groups";
import type { AiToolGroupSegment } from "../constants/groups";
import {
  AI_TOOL_LOCALES,
  // DEFAULT_LOCALE,
  normalizeAIToolLocale,
} from "../translations/config";
import type { AIToolLocale } from "../translations/config";
import type {
  AiToolBannerContentStyle,
  AiToolBannerDocument,
  AiToolBannerPromptSnippetRow,
} from "../types/types";

export {
  AI_TOOL_GROUPS,
  AI_TOOL_GROUP_SEGMENTS,
  buildAiGroupConfigDocumentId,
  buildAiToolGroupPath,
  buildAiToolPagePath,
  getGroupIdFromSegment,
  getSegmentFromGroupId,
  isAiToolGroupSegment,
  type AiToolGroupId,
  type AiToolGroupSegment,
} from "../constants/groups";

/** Turns URL group segments like `doc` into a short title (e.g. `Doc`). */
export function formatAiToolGroupToDisplayName(group: string): string {
  return formatAiToolSlugToDisplayName(group);
}

/** Turns URL segments like `image-generator` or `image_generator` into a short title (e.g. `Image Generator`). */
export function formatAiToolSlugToDisplayName(slug: string): string {
  return slug
    .split(/[-_]+/u)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/** Maps app `[locale]` to a supported AI tool Sanity language. */
export function normalizeAiToolRouteLang(locale: string): AIToolLocale {
  return normalizeAIToolLocale(locale);
}

/** Model used after redirect — aligns with `EAIValueModel.Banana_Pro`. */
export const AI_TOOL_IMAGE_GENERATOR_CONVERSATION_MODEL =
  EAIValueModel.Banana_Pro;

function localePathPrefix(locale: string): string {
  const normalized = routing.locales.includes(
    locale as (typeof routing.locales)[number]
  )
    ? locale
    : routing.defaultLocale;
  return normalized === routing.defaultLocale ? "" : `/${normalized}`;
}

/** Public path with AI-tool locale prefix (`/zh/privacy-policy` for zh, `/privacy-policy` for en). */
export function buildLocalizedPublicHref(
  locale: string,
  pathname: string
): string {
  const normalized = normalizeAIToolLocale(locale);
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return normalized === routing.defaultLocale ? path : `/${normalized}${path}`;
}

/** Removes a leading AI-tool locale segment (`/zh/pricing` → `/pricing`). */
function stripLocalePrefixFromPath(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const segments = path.split("/").filter(Boolean);
  const [first] = segments;
  if (
    first &&
    (AI_TOOL_LOCALES as readonly string[]).includes(first as AIToolLocale)
  ) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return path;
}

function splitRedirectLinkPathAndSuffix(href: string): {
  pathname: string;
  suffix: string;
} {
  const queryIndex = href.indexOf("?");
  const hashIndex = href.indexOf("#");
  const [cutIndex] = [queryIndex, hashIndex]
    .filter((index) => index >= 0)
    .toSorted((a, b) => a - b);

  if (cutIndex === undefined) {
    return { pathname: href, suffix: "" };
  }

  return {
    pathname: href.slice(0, cutIndex),
    suffix: href.slice(cutIndex),
  };
}

/**
 * Prepends the active locale to CMS `banner.redirectLink`
 * (e.g. `/conversation?model=gpt-4o` → `/zh/conversation?model=gpt-4o`).
 * Query string and hash are preserved.
 */
function normalizeAiToolBannerRedirectLink(
  locale: string,
  redirectLink: string
): string {
  const trimmed = redirectLink.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (/^https?:\/\//iu.test(trimmed)) {
    const url = new URL(trimmed);
    url.pathname = buildLocalizedPublicHref(
      locale,
      stripLocalePrefixFromPath(url.pathname)
    );
    return url.toString();
  }

  const { pathname, suffix } = splitRedirectLinkPathAndSuffix(trimmed);
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${buildLocalizedPublicHref(locale, stripLocalePrefixFromPath(path))}${suffix}`;
}

/**
 * Builds href for language switch while keeping the current route path
 * (e.g. `/zh/pricing` → `/jp/pricing`, `/image/foo` → `/th/image/foo`).
 * Uses `as-needed` prefix: default locale has no prefix.
 */
// function buildLocaleSwitchHref(targetLocale: string, pathname: string): string {
//   const path = stripLocalePrefixFromPath(pathname);
//   if (targetLocale === DEFAULT_LOCALE) {
//     return path;
//   }
//   return path === "/" ? `/${targetLocale}` : `/${targetLocale}${path}`;
// }

export interface BuildAiToolBannerConversationPathInput {
  locale: string;
}

/**
 * Path for `callbackUrl` after login (e.g. `/conversation` or `/zh/conversation`).
 * Prompt is saved to `LOCAL_STORAGE_KEY.AI_TOOL_LANDING_IMAGE_GENERATE_HANDOFF` before redirect.
 */
function buildAiToolBannerConversationCallbackPath({
  locale,
}: BuildAiToolBannerConversationPathInput): string {
  const prefix = localePathPrefix(locale);
  return `${prefix}/conversation`;
}

/** Conversation path for `next-intl` `Link` (no locale prefix; routing adds locale when needed). */
export function buildAiToolBannerConversationPathname(): string {
  return "/conversation";
}

/** Full in-app path to open conversation from the AI tool banner (includes locale prefix). */
function buildAiToolBannerConversationHref(
  input: BuildAiToolBannerConversationPathInput
): string {
  return buildAiToolBannerConversationCallbackPath(input);
}

/** Login URL with `callbackUrl` pointing at the conversation entry (or a CMS redirect target). */
function buildAiToolBannerLoginHref(
  input: BuildAiToolBannerConversationPathInput,
  callbackPath?: string
): string {
  const callback =
    callbackPath ?? buildAiToolBannerConversationCallbackPath(input);
  const prefix = localePathPrefix(input.locale);
  const loginPath = `${prefix}/login`;
  return `${loginPath}?${CALLBACK_URL_QUERY_PARAM}=${encodeURIComponent(callback)}`;
}

/** Removes every query param from a banner redirect href; hash is preserved. */
function stripBannerRedirectSearchParams(href: string): string {
  const isAbsolute = /^https?:\/\//iu.test(href);
  const base = isAbsolute ? undefined : "http://local";
  const url = new URL(href, base);
  url.search = "";

  if (isAbsolute) {
    return url.toString();
  }

  return `${url.pathname}${url.hash}`;
}

/** Appends or replaces `model` on a relative or absolute banner redirect href. */
function appendBannerModelQuery(
  href: string,
  modelValue: string | undefined
): string {
  const value = modelValue?.trim();
  if (!value) {
    return href;
  }

  const isAbsolute = /^https?:\/\//iu.test(href);
  const base = isAbsolute ? undefined : "http://local";
  const url = new URL(href, base);
  url.searchParams.set("model", value);

  if (isAbsolute) {
    return url.toString();
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

/** Banner Generate target: localized CMS `redirectLink`, or default conversation path (login callback when unauthenticated). */
export function resolveAiToolBannerGenerateHref(
  input: BuildAiToolBannerConversationPathInput & {
    redirectLink?: string;
    authed: boolean;
    model?: string;
    /** When true, drops CMS query params then sets `?model=` from the banner model selector. */
    replaceSearchParamsWithModel?: boolean;
  }
): string {
  const cmsLink = input.redirectLink?.trim();

  let destination = cmsLink
    ? normalizeAiToolBannerRedirectLink(input.locale, cmsLink)
    : buildAiToolBannerConversationHref(input);

  if (input.replaceSearchParamsWithModel) {
    destination = stripBannerRedirectSearchParams(destination);
    destination = appendBannerModelQuery(destination, input.model);
  }

  if (input.authed) {
    return destination;
  }

  return buildAiToolBannerLoginHref(input, destination);
}

/** Full navigation (`window.location.assign`). */
export function assignLocationHref(pathWithQuery: string): void {
  if (typeof window === "undefined") {
    return;
  }
  const url = new URL(pathWithQuery, window.location.origin);
  window.location.assign(url.toString());
}

/**
 * Must match {@link AI_TOOL_IMAGE_GENERATOR_CONVERSATION_MODEL}: the banner persists `artStyle`
 * enum values that are resolved post-redirect against this model's style list.
 * Using a different model than conversation caused valid landing picks to map to the wrong style.
 */
export const BANNER_ART_STYLE_MODEL =
  AI_TOOL_IMAGE_GENERATOR_CONVERSATION_MODEL;

/**
 * Default style list for the AI tool banner (values, titles, copy).
 * `AIToolArtStyleChooser` defers loading style preview images until Firebase Remote Config is ready
 * and shows skeleton thumbs until then.
 */
export function getDefaultBannerArtOptions(): TAIArtOptions[] {
  return DEFAULT_LIST_STYLE_OPTIONS.styles[BANNER_ART_STYLE_MODEL] ?? [];
}

function filterEnabledBannerArtOptions(opts: TAIArtOptions[]): TAIArtOptions[] {
  return opts.filter((o) => o.isEnabled !== false);
}

/** Initial selected style for the banner — first enabled option, or `NONE` if the list is empty. */
export function getInitialBannerArtStyle(
  options: TAIArtOptions[]
): EAIART_STYLE {
  const enabled = filterEnabledBannerArtOptions(options);
  return enabled[0]?.value ?? EAIART_STYLE.NONE;
}

export type AiToolBannerPromptSnippetKind = "text" | "image";

export interface AiToolBannerPromptSnippetItem {
  id: string;
  quickTag: string;
  kind: AiToolBannerPromptSnippetKind;
  fullPrompt?: string;
  imagePromptUrl?: string;
  imagePromptAlt?: string;
}

const BANNER_CONTENT_STYLES: ReadonlySet<AiToolBannerContentStyle> = new Set([
  "default",
  "translate",
  "qa-cards",
  "qa-simple",
  "upload-file",
]);

/** Resolves banner input placeholder: CMS `placeholder` first, then per-style i18n fallbacks. */
export function resolveAiToolBannerPlaceholder(input: {
  banner?: { placeholder?: string | null } | null;
  contentStyle: AiToolBannerContentStyle;
  propPlaceholder?: string;
  fallbacks: {
    default: string;
    translate: string;
    qaCards: string;
    qaSimple: string;
  };
}): string {
  const cms = input.banner?.placeholder?.trim();
  if (cms) {
    return cms;
  }

  const prop = input.propPlaceholder?.trim();
  if (prop && input.contentStyle === "default") {
    return prop;
  }

  switch (input.contentStyle) {
    case "translate": {
      return input.fallbacks.translate;
    }
    case "qa-cards": {
      return input.fallbacks.qaCards;
    }
    case "qa-simple": {
      return input.fallbacks.qaSimple;
    }
    default: {
      return prop || input.fallbacks.default;
    }
  }
}

/** Normalizes Sanity `banner.contentStyle`; unknown values fall back to `default`. */
export function resolveAiToolBannerContentStyle(
  style: AiToolBannerContentStyle | string | null | undefined
): AiToolBannerContentStyle {
  if (style && BANNER_CONTENT_STYLES.has(style as AiToolBannerContentStyle)) {
    return style as AiToolBannerContentStyle;
  }
  return "default";
}

function pickPromptSnippetForLocale(
  row: AiToolBannerPromptSnippetRow,
  locale: AIToolLocale
): AiToolPromptSnippet | null {
  const preferred = row[locale];
  if (preferred?.quickTag?.trim()) {
    return preferred;
  }

  for (const loc of AI_TOOL_LOCALES) {
    const fallback = row[loc];
    if (fallback?.quickTag?.trim()) {
      return fallback;
    }
  }

  return null;
}

function promptSnippetRowToItem(
  row: AiToolBannerPromptSnippetRow,
  locale: AIToolLocale
): AiToolBannerPromptSnippetItem | null {
  const snippet = pickPromptSnippetForLocale(row, locale);
  if (!snippet) {
    return null;
  }

  const quickTag = snippet.quickTag?.trim() ?? "";
  if (!quickTag) {
    return null;
  }

  const fullPrompt = snippet.fullPrompt?.trim() ?? "";
  const imagePrompt = snippet.imagePrompt as
    | { url?: string; alt?: string }
    | undefined;
  const imagePromptUrl = imagePrompt?.url?.trim() ?? "";
  const imagePromptAlt = imagePrompt?.alt?.trim() || quickTag;

  if (!fullPrompt && !imagePromptUrl) {
    return null;
  }

  return {
    id: row._key,
    kind: imagePromptUrl ? "image" : "text",
    quickTag,
    ...(fullPrompt ? { fullPrompt } : {}),
    ...(imagePromptUrl ? { imagePromptAlt, imagePromptUrl } : {}),
  };
}

/** Maps dereferenced `aiSnippetSet` rows on `banner.promptSnippets` to banner tag UI props for `locale`. */
export function serializeAiToolBannerPromptSnippets(
  banner: AiToolBannerDocument | null | undefined,
  locale: AIToolLocale
): AiToolBannerPromptSnippetItem[] {
  const list = banner?.promptSnippets;
  if (!list?.length) {
    return [];
  }

  return list
    .map((row) => promptSnippetRowToItem(row, locale))
    .filter((x): x is AiToolBannerPromptSnippetItem => x !== null);
}

export interface AiToolBannerResolvedRefImage {
  id: string;
  url: string;
  alt: string;
}

/**
 * Builds CDN URLs for `aiToolBanner.image_examples` thumbnails (56px UI @2x).
 */
// async function resolveAiToolBannerReferenceImages(
//   imageExamples:
//     | ({ _key: string; alt?: string | null } & SanityImageSource)[]
//     | null
//     | undefined
// ): Promise<AiToolBannerResolvedRefImage[]> {
//   if (!imageExamples?.length) {
//     return [];
//   }

//   const rows = await Promise.all(
//     imageExamples.map(async (img) => {
//       const url = await buildSanityImageUrlWithPreset(img, "thumbnail", {
//         width: 112,
//         height: 112,
//         fit: "crop",
//         quality: 80,
//       });
//       if (!url) {
//         return null;
//       }
//       return {
//         id: img._key,
//         url,
//         alt: (img.alt ?? "").trim(),
//       };
//     })
//   );

//   return rows.filter((r): r is AiToolBannerResolvedRefImage => r !== null);
// }

function getFallbackMetadata(
  group: AiToolGroupSegment | null,
  slug: string
): {
  title: string;
  description: string;
} {
  if (group === "image" && slug === "image-generator") {
    return {
      description:
        "Generate stunning AI images instantly with Chat Smith's powerful image generator. Turn your ideas into high-quality visuals for work, study, and creativity.",
      title: "AI Image Generator | Chat Smith",
    };
  }

  const displayName = formatAiToolSlugToDisplayName(slug);
  return {
    description:
      "Explore Chat Smith's AI tools to create, learn, and work faster.",
    title: `${displayName} | Chat Smith`,
  };
}

export function generateAiGroupMetadata(
  seo: AiSeo | null | undefined,
  locale: AIToolLocale,
  group: AiToolGroupSegment,
  content?: AiGroupConfigLocaleContent | null
): Promise<Metadata> {
  const groupName = formatAiToolGroupToDisplayName(group);
  const fallbackMeta = {
    description:
      content?.description?.trim() ||
      "Explore Chat Smith's AI tools to create, learn, and work faster.",
    title: content?.title?.trim() || `${groupName} | Chat Smith`,
  };

  return generateMetadataFromAiSeo(seo, locale, fallbackMeta, {
    alternates: {
      hrefLangLocales: routing.locales,
      locale,
      pathname: buildAiToolGroupPath(group),
    },
  });
}

export function generateAiToolMetadata(
  seo: AiSeo | null | undefined,
  locale: AIToolLocale,
  fallback: { group: AiToolGroupSegment | null; slug: string },
  options?: { hrefLangLocales?: readonly string[] }
): Promise<Metadata> {
  const fallbackMeta = getFallbackMetadata(fallback.group, fallback.slug);
  const pathname =
    fallback.group === null
      ? "/"
      : buildAiToolPagePath(fallback.group, fallback.slug);

  return generateMetadataFromAiSeo(seo, locale, fallbackMeta, {
    alternates: {
      hrefLangLocales: options?.hrefLangLocales,
      locale,
      pathname,
    },
  });
}
