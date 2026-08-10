import { readdirSync } from "node:fs";
import path from "node:path";

const { resolve } = path;

export const FIGMA_TOKENS_DIR = resolve(import.meta.dir, "../../figma-tokens");
export const CURRENT_VERSION_FILE = resolve(FIGMA_TOKENS_DIR, ".current");

export const readCurrentVersion = async (): Promise<string> => {
  const file = Bun.file(CURRENT_VERSION_FILE);
  if (!(await file.exists())) {
    throw new Error("Missing figma-tokens/.current file");
  }

  const content = await file.text();
  const version = content.trim();
  if (!version) {
    throw new Error("figma-tokens/.current is empty");
  }

  return version;
};

export const versionDir = (version: string): string =>
  resolve(FIGMA_TOKENS_DIR, version);

export const listVersions = (): string[] => {
  const versions: string[] = [];

  for (const entry of readdirSync(FIGMA_TOKENS_DIR, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name.startsWith("tokens_v")) {
      versions.push(entry.name);
    }
  }

  return versions.toSorted();
};
