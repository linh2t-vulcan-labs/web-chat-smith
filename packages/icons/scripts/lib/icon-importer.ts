/**
 * Resolves a raw Figma export (`figma-icons/icons_vX/<category>/**`) into
 * generatable icon slugs. Each top-level folder in the version dir is a
 * category (currently `icons/`, `graphics/` — a new category folder just
 * works, nothing here hardcodes the set) whose designer-given filename
 * mostly works as-is; `names.json` fills in the rest for shapes Figma only
 * gave a placeholder name like `meaning-42.svg`.
 *
 * Pure: reads files under `dumpDir` but never writes. Callers
 * (`generate-icons.ts`, `commands/preview.ts`, `commands/audit.ts`,
 * `commands/diff.ts`) decide what to do with the result.
 */
import { readdirSync } from "node:fs";
import path from "node:path";

import { toKebabCase } from "./naming";

/** Figma frame/placeholder names that aren't real icons, never resolved. */
const EXCLUDED_DIR_SEGMENTS = new Set(["meaning_control", "_meaning_control"]);
const MEANINGLESS_BASENAME = /^meaning-\d+$/iu;
const MEANINGLESS_VARIANT_BASENAME = /^type[=_].*$/iu;
const MEANINGLESS_CONTROL_BASENAME =
  /^_?meaning[_-]control(?<variant>-\d+)?$/iu;

export interface Entry {
  relPath: string;
  category: string;
  base: string;
  slug?: string;
  named: boolean;
  /** True when the slug came from `names.json` rather than the dump's own
   * filename — these are the only entries whose answer must be persisted
   * back to `names.json`, since nothing else remembers it. */
  viaOverride: boolean;
}
export type ResolutionKind = "resolved" | "duplicate" | "unresolved";
export interface Resolution {
  kind: ResolutionKind;
  slug?: string;
  entries: Entry[];
}

export const listCategories = (dumpDir: string): string[] => {
  const categories: string[] = [];
  for (const entry of readdirSync(dumpDir, { withFileTypes: true })) {
    if (entry.isDirectory() && !entry.name.startsWith(".")) {
      categories.push(entry.name);
    }
  }
  return categories.toSorted();
};

const listSvgFiles = async (dir: string): Promise<string[]> => {
  const glob = new Bun.Glob("**/*.svg");
  const files: string[] = [];
  for await (const file of glob.scan({ cwd: dir })) {
    files.push(file);
  }
  return files.toSorted();
};

const isExcludedPath = (relPath: string): boolean =>
  relPath.split(path.sep).some((segment) => EXCLUDED_DIR_SEGMENTS.has(segment));

const isMeaninglessBasename = (base: string): boolean =>
  MEANINGLESS_BASENAME.test(base) ||
  MEANINGLESS_VARIANT_BASENAME.test(base) ||
  MEANINGLESS_CONTROL_BASENAME.test(base);

const buildEntry = (
  category: string,
  relPath: string,
  namesOverride: Map<string, string>
): Entry => {
  const base = path.basename(relPath, ".svg");
  const overrideSlug = namesOverride.get(relPath);
  if (overrideSlug) {
    return {
      base,
      category,
      named: true,
      relPath,
      slug: toKebabCase(overrideSlug),
      viaOverride: true,
    };
  }
  if (isMeaninglessBasename(base)) {
    return { base, category, named: false, relPath, viaOverride: false };
  }
  return {
    base,
    category,
    named: true,
    relPath,
    slug: toKebabCase(base),
    viaOverride: false,
  };
};

interface CollectResult {
  entries: Entry[];
  unparsed: string[];
}

const collectCategoryEntries = async (
  dumpDir: string,
  category: string,
  namesOverride: Map<string, string>
): Promise<Entry[]> => {
  const categoryDir = path.join(dumpDir, category);
  const allFiles = await listSvgFiles(categoryDir);
  const files = allFiles.filter((file) => !isExcludedPath(file));
  return files.map((file) =>
    buildEntry(category, path.join(category, file), namesOverride)
  );
};

/** Walks every category folder in `dumpDir`, building one `Entry` per SVG.
 * `unparsed` is currently always empty — kept in the return shape so a future
 * unreadable/corrupt file can be reported the same way the old flat-dump
 * importer did, without changing every caller's destructuring. */
const collectEntries = async (
  dumpDir: string,
  namesOverride: Map<string, string>
): Promise<CollectResult> => {
  const categories = listCategories(dumpDir);
  const entriesByCategory = await Promise.all(
    categories.map((category) =>
      collectCategoryEntries(dumpDir, category, namesOverride)
    )
  );
  return { entries: entriesByCategory.flat(), unparsed: [] };
};

const resolveEntries = (entries: Entry[]): Resolution[] => {
  const named = entries.filter((entry) => entry.named);
  const unresolved = entries.filter((entry) => !entry.named);

  const bySlug = new Map<string, Entry[]>();
  for (const entry of named) {
    const slug = entry.slug as string;
    const group = bySlug.get(slug) ?? [];
    group.push(entry);
    bySlug.set(slug, group);
  }

  const resolutions: Resolution[] = [...bySlug.entries()].map(
    ([slug, group]) => ({
      entries: group,
      kind: group.length > 1 ? "duplicate" : "resolved",
      slug,
    })
  );

  for (const entry of unresolved) {
    resolutions.push({ entries: [entry], kind: "unresolved" });
  }

  return resolutions;
};

export interface ImportResult {
  resolutions: Resolution[];
  unparsed: string[];
}

/** Resolves every shape in every category under `dumpDir` against
 * `namesOverride` (relPath -> desired slug, for shapes with no real name in
 * the dump). Two entries resolving to the same slug (even across
 * categories, since the public import path `@cs/icons/<slug>` is flat
 * regardless of which category folder generated it lands in) come back as
 * one `"duplicate"` resolution — the human disambiguates via `names.json`,
 * same as an unresolved shape. */
export const resolveDump = async (
  dumpDir: string,
  namesOverride: Map<string, string>
): Promise<ImportResult> => {
  const { entries, unparsed } = await collectEntries(dumpDir, namesOverride);
  return { resolutions: resolveEntries(entries), unparsed };
};

export const byKind = (
  resolutions: Resolution[],
  kind: ResolutionKind
): Resolution[] => resolutions.filter((r) => r.kind === kind);
