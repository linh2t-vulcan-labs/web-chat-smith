import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import { listVersions } from "./figma-icons-version";

const PACKAGE_JSON_FILE = path.resolve(import.meta.dir, "../../package.json");
const GENERATED_ICONS_ROOT = path.resolve(
  import.meta.dir,
  "../../generated-icons"
);

interface IconsPackageJson {
  exports?: Record<string, string>;
  [key: string]: unknown;
}

/** `icons` is the primary category, so it exports flat at `./*` instead of
 * `./icons/*` — the common `@cs/icons/<slug>` import shouldn't stutter with
 * the package name. Every other category (`graphics`, ...) gets its own
 * named subpath, `./<category>/*`. */
const DEFAULT_CATEGORY = "icons";

const categoryPrefix = (category: string): string =>
  category === DEFAULT_CATEGORY ? "" : `${category}/`;

/** `./<prefix>*` -> `./generated-icons/<version>/<category>/*.tsx`, one
 * wildcard per category. Each category folder is its own single-target
 * pattern (no array fallback), so `@cs/icons/x` / `@cs/icons/graphics/x`
 * resolve the same way under Node, webpack, and Turbopack — unlike a merged
 * `"./*"` across categories, which needs fs-existence fallback to pick the
 * right array entry and Turbopack doesn't implement that for wildcards. */
const toCategoryExports = (
  version: string,
  categories: string[]
): Record<string, string> => {
  const exportsMap: Record<string, string> = {};
  for (const category of categories.toSorted()) {
    exportsMap[`./${categoryPrefix(category)}*`] =
      `./generated-icons/${version}/${category}/*.tsx`;
  }
  return exportsMap;
};

/** A version other than the one this run just generated only gets an entry
 * if it actually has output on disk — unlike the current version (which we
 * just wrote), we don't assume a source-only version is buildable. */
const categoriesOnDisk = (version: string): string[] => {
  const versionDir = path.join(GENERATED_ICONS_ROOT, version);
  if (!existsSync(versionDir)) {
    return [];
  }
  const categories: string[] = [];
  for (const entry of readdirSync(versionDir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      categories.push(entry.name);
    }
  }
  return categories;
};

/** Keeps package.json's exports in sync with generated-icons/, mirroring how
 * `@cs/design-tokens`'s `version.ts` syncs its own exports on every version
 * switch: `.`/`./latest/<category>/*` always point at the current version,
 * and every version with real output on disk gets its own pinned
 * `./<version>/<category>/*` subpath so switching `.current` doesn't strand
 * an app that imported a specific version. */
export const syncPackageExports = async (
  currentVersion: string,
  currentCategories: string[]
): Promise<void> => {
  const packageJsonFile = Bun.file(PACKAGE_JSON_FILE);
  const packageJson = (await packageJsonFile.json()) as IconsPackageJson;

  const currentCategoryExports = toCategoryExports(
    currentVersion,
    currentCategories
  );
  const exportsMap: Record<string, string> = {
    ".": "./generated-icons/index.ts",
  };

  for (const [categoryPath, target] of Object.entries(currentCategoryExports)) {
    exportsMap[categoryPath] = target;
    exportsMap[`./latest${categoryPath.slice(1)}`] = target;
    exportsMap[`./${currentVersion}${categoryPath.slice(1)}`] = target;
  }

  for (const version of listVersions()) {
    if (version === currentVersion) {
      continue;
    }
    const categories = categoriesOnDisk(version);
    for (const [categoryPath, target] of Object.entries(
      toCategoryExports(version, categories)
    )) {
      exportsMap[`./${version}${categoryPath.slice(1)}`] ??= target;
    }
  }

  packageJson.exports = exportsMap;
  await Bun.write(
    PACKAGE_JSON_FILE,
    `${JSON.stringify(packageJson, null, 2)}\n`
  );
};
