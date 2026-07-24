import { groq } from "next-sanity";

/** Published locales for a policy document identified by slug. */
export const POLICY_PAGE_LOCALES_QUERY = groq`
*[_type == "policies" && slug.current == $slug && defined(language)].language
`;
