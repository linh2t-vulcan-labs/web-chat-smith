import { groq } from "next-sanity";

/**
 * Dereferences one `aiToolCategory` array item (`{ _key, _ref }`) and nested `aiToolLink` refs.
 * Uses `...@->` so GROQ returns full documents, not bare references.
 */
export const AI_TOOL_CATEGORY_ARRAY = groq`
  _key,
  ...@->{
    _id,
    categoryTitleByLocale,
    links[]{
      _key,
      ...@->{
        _id,
        url,
        linkTitleByLocale
      }
    }
  }
`;

/** Latest blogs by language for the AI tool resource section (max 12). */
export const LATEST_BLOGS_FOR_AI_TOOL_QUERY = groq`
*[_type == "blogs" && language == $lang]
  | order(publishedAt desc)[0...12] {
    _id,
    language,
    title,
    tags,
    blogId,
    brief,
    createdAt,
    publishedAt,
    authorImage {
      "alt": asset->alt,
      "mimeType": asset->mimeType,
      "url": asset->url,
      "lqip": asset->metadata.lqip,
      "asset": {
        "_id": asset->_id,
        "_ref": asset->_ref
      }
    },
    authorName,
    slug {
      current
    },
    image {
      "alt": asset->alt,
      "mimeType": asset->mimeType,
      "url": asset->url,
      "lqip": asset->metadata.lqip,
      "asset": {
        "_id": asset->_id,
        "_ref": asset->_ref
      }
    },
    "category": category->{
      title,
      slug
    }
  }
`;

/** Blogs filtered by tag reference IDs (max 12, ordered by publishedAt desc). */
export const BLOGS_BY_TAG_IDS_QUERY = groq`
*[_type == "blogs" && language == $lang && count(tags[_ref in $tagIds]) > 0]
  | order(publishedAt desc)[0...12] {
    _id,
    language,
    title,
    tags,
    blogId,
    brief,
    createdAt,
    publishedAt,
    authorImage {
      "alt": asset->alt,
      "mimeType": asset->mimeType,
      "url": asset->url,
      "lqip": asset->metadata.lqip,
      "asset": {
        "_id": asset->_id,
        "_ref": asset->_ref
      }
    },
    authorName,
    slug {
      current
    },
    image {
      "alt": asset->alt,
      "mimeType": asset->mimeType,
      "url": asset->url,
      "lqip": asset->metadata.lqip,
      "asset": {
        "_id": asset->_id,
        "_ref": asset->_ref
      }
    },
    "category": category->{
      title,
      slug
    }
  }
`;

/** Dereferences one `blogs` reference for the AI tool resource blog section. */
export const AI_TOOL_BLOG_ARRAY = groq`
  _key,
  ...@->{
    _id,
    language,
    title,
    tags,
    blogId,
    brief,
    createdAt,
    publishedAt,
    authorImage {
      "alt": asset->alt,
      "mimeType": asset->mimeType,
      "url": asset->url,
      "lqip": asset->metadata.lqip,
      "asset": {
        "_id": asset->_id,
        "_ref": asset->_ref
      }
    },
    authorName,
    slug {
      current
    },
    image {
      "alt": asset->alt,
      "mimeType": asset->mimeType,
      "url": asset->url,
      "lqip": asset->metadata.lqip,
      "asset": {
        "_id": asset->_id,
        "_ref": asset->_ref
      }
    },
    "category": category->{
      title,
      slug
    }
  }
`;

/** Singleton `header` — product nav categories for header and footer. */
export const HEADER_CATEGORIES_QUERY = groq`
*[_type == "header"][0]{
  "categories": categories[]{${AI_TOOL_CATEGORY_ARRAY}},
  "extra_categories": extra_categories[]{${AI_TOOL_CATEGORY_ARRAY}}
}`;

/** Expanded `aiSeo` reference — per-locale `title`, `description`, `ogImage`, `ogImageAlt`. */
export const AI_SEO_PROJECTION = groq`
  _id,
  _type,
  name,
  en { title, description, ogImage, ogImageAlt },
  zh { title, description, ogImage, ogImageAlt },
  th { title, description, ogImage, ogImageAlt },
  ar { title, description, ogImage, ogImageAlt },
  es { title, description, ogImage, ogImageAlt },
  ko { title, description, ogImage, ogImageAlt },
  ja { title, description, ogImage, ogImageAlt },
  hi { title, description, ogImage, ogImageAlt }
`;

/** Locale fields on dereferenced `aiSnippetSet` prompt snippets. */
const AI_TOOL_PROMPT_SNIPPET_LOCALE = groq`
  quickTag,
  fullPrompt,
  imagePrompt {
    "alt": coalesce(asset->altText, asset->alt),
    "url": asset->url
  }
`;

/** Dereferenced `aiSnippetSet` for `banner.promptSnippets[]` (all locales; pick active locale in app code). */
const AI_TOOL_BANNER_PROMPT_SNIPPET = groq`
  _key,
  ...@->{
    _id,
    _type,
    en { ${AI_TOOL_PROMPT_SNIPPET_LOCALE} },
    zh { ${AI_TOOL_PROMPT_SNIPPET_LOCALE} },
    th { ${AI_TOOL_PROMPT_SNIPPET_LOCALE} },
    ar { ${AI_TOOL_PROMPT_SNIPPET_LOCALE} },
    es { ${AI_TOOL_PROMPT_SNIPPET_LOCALE} },
    ko { ${AI_TOOL_PROMPT_SNIPPET_LOCALE} },
    ja { ${AI_TOOL_PROMPT_SNIPPET_LOCALE} },
    hi { ${AI_TOOL_PROMPT_SNIPPET_LOCALE} }
  }
`;

/** Locale block on dereferenced `aiToolSectionSchema`. */
const AI_TOOL_SECTION_BY_LOCALE = groq`
  richText {
    prefix,
    main,
    suffix
  },
  subTitle,
  items[]{
    _key,
    _type,
    title,
    description,
    url,
    image {
      _type,
      alt,
      caption,
      title,
      hotspot,
      crop,
      asset->{
        _id,
        url
      }
    }
  }
`;

/** Dereferenced `aiToolSectionSchema` with all locale fields (pick active locale in app code). */
const AI_TOOL_SECTION_ARRAY = groq`
  _key,
  ...@->{
    _id,
    _type,
    name,
    sectionType,
    en {
      ${AI_TOOL_SECTION_BY_LOCALE}
    },
    zh {
      ${AI_TOOL_SECTION_BY_LOCALE}
    },
    th {
      ${AI_TOOL_SECTION_BY_LOCALE}
    },
    ar {
      ${AI_TOOL_SECTION_BY_LOCALE}
    },
    es {
      ${AI_TOOL_SECTION_BY_LOCALE}
    },
    ko {
      ${AI_TOOL_SECTION_BY_LOCALE}
    },
    ja {
      ${AI_TOOL_SECTION_BY_LOCALE}
    },
    hi {
      ${AI_TOOL_SECTION_BY_LOCALE}
    }
  }
`;

/**
 * Hero banner for `AIToolBanner`: nested `banner` object, or legacy flat `heading` / `description` / `promptSnippets` on `aiTool`.
 */
const AI_TOOL_BANNER = groq`
  coalesce(
    banner {
      _type,
      heading {
        prefix,
        main,
        suffix
      },
      description,
      contentStyle,
      allowSelectModel,
      placeholder,
      redirectLink,
      promptSnippets[]{${AI_TOOL_BANNER_PROMPT_SNIPPET}}
    },
    select(
      defined(heading) || defined(description) => {
        "_type": "aiToolBanner",
        "heading": heading {
          prefix,
          main,
          suffix
        },
        "description": description
      }
    )
  )
`;

/**
 * Single `aiTool` by locale, slug, and Sanity `groupId` (published API).
 *
 * Debug in Vision:
 * - `*[_type == "aiTool"]{ _id, language, slug, groupId }`
 * - `*[_type == "aiTool" && slug.current == $slug && groupId == $groupId]{ _id, language }`
 */
export const AI_TOOL_PAGE_QUERY = groq`
*[_type == "aiTool" && language == $lang && slug.current == $slug && groupId == $groupId][0]{
  ...,
  linkAiTool {
    richText {
      prefix,
      main,
      suffix
    },
    subTitle,
    groupIds
  },
  "sections": sections[]{${AI_TOOL_SECTION_ARRAY}},
  "seo": seo->{${AI_SEO_PROJECTION}},
  "banner": ${AI_TOOL_BANNER},
  "faq": faq->{
    _id,
    _type,
    itemsByLocale
  },
  "blogs": blogs[]{${AI_TOOL_BLOG_ARRAY}},
  "blogTagIds": blogTags[]._ref
}`;

/** Published locales for a single AI tool page (hreflang). */
export const AI_TOOL_PAGE_LOCALES_QUERY = groq`
*[_type == "aiTool" && slug.current == $slug && groupId == $groupId && defined(language)].language
`;

/** Distinct published slugs + groupId for static generation. */
export const AI_TOOL_STATIC_PARAMS_QUERY = groq`
*[_type == "aiTool" && defined(slug.current) && defined(groupId)]{
  "slug": slug.current,
  groupId
}`;

/** Locale fields on `aiGroupConfig` (one document per Sanity `groupId`). */
const AI_GROUP_CONFIG_LOCALE = groq`
  title,
  description
`;

/**
 * Group landing copy by Sanity `groupId` (maps from URL segment via `getGroupIdFromSegment`).
 * Documents are keyed by `_id` (`aiGroupConfig-ai-tool-doc`); `groupId` is used when set in Studio.
 *
 * Debug in Vision:
 * - `*[_type == "aiGroupConfig"]{ _id, groupId, en }`
 */
export const AI_GROUP_CONFIG_QUERY = groq`
*[_type == "aiGroupConfig" && (_id == $configId || groupId == $groupId)][0]{
  _id,
  _type,
  groupId,
  "seo": seo->{${AI_SEO_PROJECTION}},
  en { ${AI_GROUP_CONFIG_LOCALE} },
  zh { ${AI_GROUP_CONFIG_LOCALE} },
  th { ${AI_GROUP_CONFIG_LOCALE} },
  ar { ${AI_GROUP_CONFIG_LOCALE} },
  es { ${AI_GROUP_CONFIG_LOCALE} },
  ko { ${AI_GROUP_CONFIG_LOCALE} },
  ja { ${AI_GROUP_CONFIG_LOCALE} },
  hi { ${AI_GROUP_CONFIG_LOCALE} }
}`;

/** Published `aiTool` titles for a group landing page (locale + `groupId`). */
export const AI_GROUP_TOOLS_QUERY = groq`
*[_type == "aiTool" && language == $lang && groupId == $groupId && defined(slug.current)] | order(title asc) {
  _id,
  title,
  "slug": slug.current
}`;

/** `aiTool` preview rows for MoreResourceAITool — filtered by locale and `linkAiTool.groupIds`. */
export const MORE_RESOURCE_AI_TOOLS_QUERY = groq`
*[_type == "aiTool" && language == $lang && defined(slug.current) && defined(groupId) && groupId in $groupIds]{
  _id,
  "slug": slug.current,
  groupId,
  preview {
    preview_title,
    preview_description,
    image {
      _type,
      alt,
      hotspot,
      crop,
      asset->{
        _id,
        url
      }
    }
  }
}`;
