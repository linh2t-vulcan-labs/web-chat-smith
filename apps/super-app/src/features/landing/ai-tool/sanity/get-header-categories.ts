import { env } from "@cs/env";
import { unstable_cache } from "next/cache";

import { safeSanityFetchWithFallback } from "@/libs/sanity";

import type { AIToolHeaderCategoryRow } from "../types/types";
import { normalizeCategoryRows } from "./helpers/normalize-category-rows";
import { HEADER_CATEGORIES_QUERY } from "./queries";

export interface HeaderCategories {
  categories: AIToolHeaderCategoryRow[];
  extraCategories: AIToolHeaderCategoryRow[];
}

const EMPTY_HEADER_CATEGORIES: HeaderCategories = {
  categories: [],
  extraCategories: [],
};

interface HeaderCategoriesDocument {
  categories?: unknown[];
  extra_categories?: unknown[];
}

function resolveHeaderCategories(
  doc: HeaderCategoriesDocument | null
): HeaderCategories {
  if (!doc) {
    return EMPTY_HEADER_CATEGORIES;
  }

  return {
    categories: normalizeCategoryRows(doc.categories),
    extraCategories: normalizeCategoryRows(doc.extra_categories),
  };
}

/** Shared product nav categories from the singleton Sanity `header` document. */
export const getHeaderCategories = unstable_cache(
  async (): Promise<HeaderCategories> => {
    const doc =
      await safeSanityFetchWithFallback<HeaderCategoriesDocument | null>(
        HEADER_CATEGORIES_QUERY,
        null,
        {},
        {
          next: {
            revalidate: env.SANITY_REVALIDATE_TIME,
            tags: ["header", "header-categories"],
          },
        }
      );

    return resolveHeaderCategories(doc);
  },
  ["header-categories"],
  {
    revalidate: env.SANITY_REVALIDATE_TIME,
    tags: ["header-categories"],
  }
);
