import { groq } from "next-sanity";

// const LATEST_BLOG_QUERY = groq`
// *[_type == "blogs" && language == $lang]
//   | order(publishedAt desc)[0] {
//     _id,
//     title,
//     tags,
//     blogId,
//     authorImage { "alt": asset->alt, "mimeType": asset->mimeType, "url": asset->url },
//     authorName,
//     brief,
//     createdAt,
//     publishedAt,
//     slug {
//       current
//     },
//     image {
//       "alt": asset->alt,
//       "mimeType": asset->mimeType,
//       "url": asset->url
//     },
//     "category": category->{
//       title,
//       slug
//     }
//   }
// `;

/** Latest blogs for a single Sanity `language` (e.g. en, zh). */
// const LATEST_BLOGS_BY_LANGUAGE_QUERY = groq`
// *[_type == "blogs" && language == $lang]
//   | order(publishedAt desc)[0...3] {
//     _id,
//     title,
//     tags,
//     blogId,
//     brief,
//     createdAt,
//     publishedAt,
//     authorImage {
//       "alt": asset->alt,
//       "mimeType": asset->mimeType,
//       "url": asset->url,
//       "lqip": asset->metadata.lqip,
//       "asset": {
//         "_id": asset->_id,
//         "_ref": asset->_ref
//       }
//     },
//     authorName,
//     slug {
//       current
//     },
//     image {
//       "alt": asset->alt,
//       "mimeType": asset->mimeType,
//       "url": asset->url,
//       "lqip": asset->metadata.lqip,
//       "asset": {
//         "_id": asset->_id,
//         "_ref": asset->_ref
//       }
//     },
//     "category": category->{
//       title,
//       slug
//     }
//   }
// `;

export const LATEST_BLOGS_QUERY = groq`
*[_type == "blogs" && language == $lang]
  | order(publishedAt desc)[0...7] {
    _id,
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

export const SITEMAP_BLOGS_QUERY = `
{
  "blogs": *[
    _type == "blogs"
  ]
  | order(publishedAt desc)
  [$start...$end] {
    slug {
      current
    },
    language,
    _updatedAt,
    _createdAt,
    publishedAt,
    blogId,
    "category": category->{
      title,
      slug
    }
  },

  "total": count(*[
    _type == "blogs"
  ])
}
`;

export const TOTAL_BLOGS_QUERY = `
{
  "total": count(*[_type == "blogs"])
}
`;

/** Published `aiTool` rows for sitemap (`/{group}/{slug}` per locale). */
export const SITEMAP_AI_TOOL_PAGES_QUERY = groq`
*[_type == "aiTool" && defined(slug.current) && defined(language) && defined(groupId)]
  | order(_updatedAt desc) {
    _id,
    _updatedAt,
    language,
    groupId,
    "slug": slug.current
  }
`;

export const POLICY_BY_SLUG_QUERY = groq`*[_type == "policies" && slug.current == $slug && language == $lang][0]{
      _id, title, "slug": slug.current, content, seo{title, brief}
    }`;

export const SITEMAP_POLICY_QUERY = groq`*[_type == "policies" && language == $lang]{
      _id, title, "slug": slug.current, _updatedAt, createdAt
    }`;

/** Resolves `footerLinkLabel` for `$lang`; missing or empty values use English. */
export const FOOTER_LINKS_QUERY = groq`
*[_type == "footer"][0]{
    footerLinks[]{
      "label": select(
        length(coalesce(label[$lang], "")) > 0 => label[$lang],
        true => coalesce(label.en, "")
      ),
      href
    },
    backgroundImage { "mimeType": asset->mimeType, "url": asset->url }
  }
`;

export const HOMEPAGE_DATA_QUERY = groq`*[_type == "homePage" && language == $lang][0] {
  _id,
  _type,
  language,
  appStoreLink,
  chPlayLink,
  hero {
    title,
    subtitle,
    cta,
    highlight
  },
  features {
    title,
    subtitle,
    items[] {
      name,
      description,
      link,
      isMore
    }
  },
  useCases {
    title,
    items[] {
      title,
      content,
      highlight[]
    }
  },
  plan {
    title,
    benefits[] {
      title,
      description,
      isProPlan,
      isLimit
    }
  },
  faq[] {
    question,
    answer
  }
}`;

export const METADATA_QUERY = groq`
*[_type == "pageMetadata" && pageId == $pageId && language == $lang][0] {
  title,
  description,
  keywords
}`;

/** `llms.txt` content served at `/llms.txt` for AI crawlers. */
export const LLMS_TXT_CONFIG_QUERY = groq`*[_type == "llmsTxtConfig"][0] {
  content
}`;
