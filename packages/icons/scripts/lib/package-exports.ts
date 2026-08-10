import { existsSync, readdirSync } from "node:fs";
import path from "node:path";

import { listVersions } from "./figma-icons-version";

const PACKAGE_JSON_FILE = path.resolve(import.meta.dir, "../../package.json");
const GENERATED_ICONS_ROOT = path.resolve(
  import.meta.dir,
  "../../generated-icons"
);

type ExportTarget = string | string[];

interface IconsPackageJson {
  exports?: Record<string, ExportTarget>;
  [key: string]: unknown;
}

const toCategoryPatterns = (version: string, categories: string[]): string[] =>
  categories
    .toSorted()
    .map((category) => `./generated-icons/${version}/${category}/*.tsx`);

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
 * switch: `.`/`./latest` always point at the current version, and every
 * version with real output on disk gets its own pinned `./<version>/*`
 * subpath so switching `.current` doesn't strand an app that imported a
 * specific version. Node resolves an array target by trying each entry in
 * order until one exists, so `@cs/icons/<slug>` keeps working as a flat
 * public import path even though the files live in per-category folders. */
export const syncPackageExports = async (
  currentVersion: string,
  currentCategories: string[]
): Promise<void> => {
  const packageJsonFile = Bun.file(PACKAGE_JSON_FILE);
  const packageJson = (await packageJsonFile.json()) as IconsPackageJson;

  const currentPatterns = toCategoryPatterns(currentVersion, currentCategories);
  const exportsMap: Record<string, ExportTarget> = {
    ".": "./generated-icons/index.ts",
    "./*": currentPatterns,
    "./latest/*": currentPatterns,
    [`./${currentVersion}/*`]: currentPatterns,
  };

  for (const version of listVersions()) {
    if (version === currentVersion || `./${version}/*` in exportsMap) {
      continue;
    }
    const categories = categoriesOnDisk(version);
    if (categories.length > 0) {
      exportsMap[`./${version}/*`] = toCategoryPatterns(version, categories);
    }
  }

  packageJson.exports = exportsMap;
  await Bun.write(
    PACKAGE_JSON_FILE,
    `${JSON.stringify(packageJson, null, 2)}\n`
  );
};
