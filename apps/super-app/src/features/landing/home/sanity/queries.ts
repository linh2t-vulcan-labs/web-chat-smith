import { groq } from "next-sanity";

import { AI_SEO_PROJECTION } from "../../ai-tool/sanity/queries";

/** `aiSeo` document for the public homepage (`/home`). */
export const HOME_SEO_QUERY = groq`
*[_type == "aiSeo" && name == "home"][0]{${AI_SEO_PROJECTION}}
`;

const HOME_PAGE_METADATA_BY_LANG = groq`
  select(
    $lang == "en" => en.pageMetadata->{ title, description, keywords },
    $lang == "zh" => zh.pageMetadata->{ title, description, keywords },
    $lang == "th" => th.pageMetadata->{ title, description, keywords },
    $lang == "ar" => ar.pageMetadata->{ title, description, keywords },
    $lang == "es" => es.pageMetadata->{ title, description, keywords },
    $lang == "ko" => ko.pageMetadata->{ title, description, keywords },
    $lang == "ja" => ja.pageMetadata->{ title, description, keywords },
    $lang == "hi" => hi.pageMetadata->{ title, description, keywords }
  )
`;

/** Singleton `homePageConfig` — locale `pageMetadata` reference. */
export const HOME_PAGE_CONFIG_QUERY = groq`
*[_type == "homePageConfig"][0]{
  _id,
  _type,
  "metadata": ${HOME_PAGE_METADATA_BY_LANG}
}`;
