import type { AiToolTitleByLocale } from "@/libs/sanity/sanity.types";

import type {
  AIToolHeaderCategoryLinkRow,
  AIToolHeaderCategoryRow,
  AIToolHeaderResolvedCategory,
} from "../../types/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUnresolvedReference(value: unknown): boolean {
  return isRecord(value) && typeof value._ref === "string" && !("_id" in value);
}

function normalizeLinkRow(item: unknown): AIToolHeaderCategoryLinkRow | null {
  if (!isRecord(item)) {
    return null;
  }

  const _key = typeof item._key === "string" ? item._key : "";

  if (
    isRecord(item.link) &&
    typeof item.link._id === "string" &&
    !isUnresolvedReference(item.link)
  ) {
    return {
      _key,
      link: {
        _id: item.link._id,
        linkTitleByLocale: item.link.linkTitleByLocale as
          | AiToolTitleByLocale
          | undefined,
        url: typeof item.link.url === "string" ? item.link.url : undefined,
      },
    };
  }

  if (typeof item._id === "string" && !isUnresolvedReference(item)) {
    return {
      _key,
      link: {
        _id: item._id,
        linkTitleByLocale: item.linkTitleByLocale as
          | AiToolTitleByLocale
          | undefined,
        url: typeof item.url === "string" ? item.url : undefined,
      },
    };
  }

  return null;
}

function normalizeCategoryRow(item: unknown): AIToolHeaderCategoryRow | null {
  if (!isRecord(item)) {
    return null;
  }

  const _key = typeof item._key === "string" ? item._key : "";

  if (isUnresolvedReference(item)) {
    return null;
  }

  let source: Record<string, unknown> | null = null;

  if (isRecord(item.category) && typeof item.category._id === "string") {
    source = item.category;
  } else if (typeof item._id === "string") {
    source = item;
  }

  if (
    !source ||
    isUnresolvedReference(source) ||
    typeof source._id !== "string"
  ) {
    return null;
  }

  const links = Array.isArray(source.links)
    ? source.links
        .map(normalizeLinkRow)
        .filter((row): row is AIToolHeaderCategoryLinkRow => row !== null)
    : undefined;

  const category: AIToolHeaderResolvedCategory = {
    _id: source._id,
    categoryTitleByLocale: source.categoryTitleByLocale as
      | AiToolTitleByLocale
      | undefined,
    links,
  };

  return { _key, category };
}

/** Maps GROQ `...@->` rows (flat or nested) into `{ _key, category, link }` shape for header/footer. */
export function normalizeCategoryRows(
  rows: unknown
): AIToolHeaderCategoryRow[] {
  if (!Array.isArray(rows)) {
    return [];
  }
  return rows
    .map(normalizeCategoryRow)
    .filter((row): row is AIToolHeaderCategoryRow => row !== null);
}
