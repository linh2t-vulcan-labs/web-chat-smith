import { groq } from "next-sanity";

import { AI_SEO_PROJECTION } from "../../ai-tool/sanity/queries";

/**
 * Single `pricing` document by Sanity `language` (matches route locale).
 */
export const PRICING_BY_LANGUAGE_QUERY = groq`
*[_type == "pricing" && language == $lang][0]{
  ...,
  "seo": seo->{${AI_SEO_PROJECTION}},
  "faq": faq->{
    _id,
    _type,
    itemsByLocale
  }
}`;
