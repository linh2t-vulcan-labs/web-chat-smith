import type {
  AiToolSectionByLocale,
  AiToolSectionSchema,
} from "@/libs/sanity/sanity.types";

import { AI_TOOL_LOCALES } from "../translations/config";
import type { AIToolLocale } from "../translations/config";
import type {
  AiToolSectionResolved,
  AiToolSectionSchemaRow,
} from "../types/types";
import { pickByLocaleKey } from "../utils/locale-record";
import { normalizeAiToolRichText } from "../utils/normalize-rich-text";

function hasSectionContent(
  byLocale: AiToolSectionByLocale | undefined
): boolean {
  if (!byLocale) {
    return false;
  }
  return Boolean(
    byLocale.richText?.prefix?.trim() ||
    byLocale.richText?.main?.trim() ||
    byLocale.richText?.suffix?.trim() ||
    byLocale.subTitle?.trim() ||
    (byLocale.items?.length ?? 0) > 0
  );
}

function pickSectionByLocale(
  section: AiToolSectionSchema,
  locale: AIToolLocale
): AiToolSectionByLocale | undefined {
  const preferred = pickByLocaleKey(section, locale);
  if (hasSectionContent(preferred)) {
    return preferred;
  }

  for (const loc of AI_TOOL_LOCALES) {
    const fallback = pickByLocaleKey(section, loc);
    if (hasSectionContent(fallback)) {
      return fallback;
    }
  }

  return preferred ?? section.en;
}

/** Merges `AiToolSectionByLocale` for `locale` onto each section for render components. */
export function resolveSectionsForLocale(
  rows: AiToolSectionSchemaRow[] | undefined | null,
  locale: AIToolLocale
): AiToolSectionResolved[] {
  if (!rows?.length) {
    return [];
  }

  return rows
    .map((row) => {
      const { _key, ...schema } = row;
      if (!schema._id || !schema.sectionType) {
        return null;
      }

      const byLocale = pickSectionByLocale(schema, locale);

      return {
        _createdAt: schema._createdAt,
        _id: schema._id,
        _key,
        _rev: schema._rev,
        _type: schema._type,
        _updatedAt: schema._updatedAt,
        items: byLocale?.items,
        name: schema.name,
        richText: normalizeAiToolRichText(byLocale?.richText),
        sectionType: schema.sectionType,
        subTitle: byLocale?.subTitle,
      };
    })
    .filter((section) => section !== null);
}
