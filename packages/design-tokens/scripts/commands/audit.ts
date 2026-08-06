import { readdirSync } from "node:fs";
import path from "node:path";

import { styleText } from "../lib/utils/console-colors";
import { CURRENT_VERSION_FILE, FIGMA_TOKENS_DIR } from "../lib/version";

const { resolve } = path;

interface VersionFiles {
  files: string[];
  version: string;
  versionDir: string;
}

const printCurrentVersionStatus = (current: string | null): void => {
  if (current) {
    console.log(styleText("green", `✓ Current version: ${current}`));
    return;
  }

  console.warn(styleText("yellow", "⚠️  .current file is empty or missing"));
};

const printVersionFileStatus = (file: string, content: string): void => {
  try {
    const data = JSON.parse(content) as Record<string, unknown>;
    console.log(`  ✓ ${file}: ${Object.keys(data).length} tokens`);
  } catch {
    console.log(styleText("red", `  ✗ ${file}: parse error`));
  }
};

const printVersionAudit = (
  versionFiles: VersionFiles,
  contents: string[]
): void => {
  console.log(styleText("bold", `${versionFiles.version}/`));

  for (const [index, file] of versionFiles.files.entries()) {
    printVersionFileStatus(file, contents[index] ?? "");
  }

  console.log("");
};

const readCurrentVersionOrNull = async (): Promise<string | null> => {
  const currentFile = Bun.file(CURRENT_VERSION_FILE);
  if (!(await currentFile.exists())) {
    return null;
  }

  const text = await currentFile.text();
  const content = text.trim();
  return content || null;
};

export const run = async (): Promise<void> => {
  console.log(styleText("cyan", "🔍 Auditing Figma token files...\n"));

  printCurrentVersionStatus(await readCurrentVersionOrNull());

  const versions = readdirSync(FIGMA_TOKENS_DIR)
    .filter((name) => name.startsWith("tokens_v"))
    .toSorted()
    .toReversed();

  console.log(
    styleText("blue", `\nFound ${versions.length} token versions:\n`)
  );

  const versionFiles: VersionFiles[] = versions.map((version) => {
    const versionDir = resolve(FIGMA_TOKENS_DIR, version);
    const files = readdirSync(versionDir).filter((f) => f.endsWith(".json"));
    return { files, version, versionDir };
  });

  const contentsByVersion = await Promise.all(
    versionFiles.map(({ files, versionDir }) =>
      Promise.all(
        files.map((file) => Bun.file(resolve(versionDir, file)).text())
      )
    )
  );

  for (const [versionIndex, entry] of versionFiles.entries()) {
    printVersionAudit(entry, contentsByVersion[versionIndex] ?? []);
  }

  console.log(
    styleText("green", "✅ Audit complete. Ready to build token pipeline.")
  );
};
