import { FAQ_URL } from "@/utils/constants/url";

/** Public pathname for FAQ routes (`/faq`, `/faq/{category}`, `/faq/{category}/{slug}`). */
export function buildFaqPathname(
  categorySlug?: string,
  questionSlug?: string
): string {
  if (!categorySlug) {
    return FAQ_URL;
  }
  if (!questionSlug) {
    return `${FAQ_URL}/${categorySlug}`;
  }
  return `${FAQ_URL}/${categorySlug}/${questionSlug}`;
}
