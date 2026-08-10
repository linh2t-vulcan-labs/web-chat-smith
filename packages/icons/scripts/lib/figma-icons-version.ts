import { readdirSync } from "node:fs";
import path from "node:path";

const FIGMA_ICONS_DIR = path.resolve(import.meta.dir, "../../figma-icons");
export const CURRENT_VERSION_FILE = path.resolve(FIGMA_ICONS_DIR, ".current");
const VERSION_PREFIX = "icons_v";

export const readCurrentVersion = async (): Promise<string> => {
  const file = Bun.file(CURRENT_VERSION_FILE);
  if (!(await file.exists())) {
    throw new Error("Missing figma-icons/.current file");
  }

  const text = await file.text();
  const version = text.trim();
  if (!version) {
    throw new Error("figma-icons/.current is empty");
  }

  return version;
};

export const listVersions = (): string[] => {
  const versions: string[] = [];
  for (const entry of readdirSync(FIGMA_ICONS_DIR, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.startsWith(VERSION_PREFIX)) {
      versions.push(entry.name);
    }
  }
  return versions.toSorted();
};

export const versionDir = (version: string): string =>
  path.resolve(FIGMA_ICONS_DIR, version);

export const assertValidVersionName = (name: string): void => {
  if (!name.startsWith(VERSION_PREFIX)) {
    throw new Error(`Version name must start with "${VERSION_PREFIX}"`);
  }
};
