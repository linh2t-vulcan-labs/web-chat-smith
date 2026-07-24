const NON_WORD = /[^a-z0-9]+/giu;
const LEADING_TRAILING_HYPHENS = /^-+|-+$/gu;

/** "3 days view" -> "3-days-view", "brain AI" -> "brain-ai" */
export const toKebabCase = (input: string): string =>
  input
    .toLowerCase()
    .replace(NON_WORD, "-")
    .replaceAll(LEADING_TRAILING_HYPHENS, "");

const toPascalCase = (slug: string): string =>
  slug
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");

/** "3-days-view" -> "Icon3DaysView". Prefixing avoids leading-digit identifiers. */
export const toComponentName = (slug: string): string =>
  `Icon${toPascalCase(slug)}`;
