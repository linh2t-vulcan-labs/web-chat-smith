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

export const run = async (): Promise<void> => {
  console.log(styleText("cyan", "🔍 Auditing Figma token files...\n"));

  const currentFile = Bun.file(CURRENT_VERSION_FILE);
  const currentExists = await currentFile.exists();
  const currentContent = currentExists ? await currentFile.text() : "";
  const current = currentExists ? currentContent.trim() : null;

  if (current) {
    console.log(styleText("green", `✓ Current version: ${current}`));
  } else {
    console.warn(styleText("yellow", "⚠️  .current file is empty or missing"));
  }

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

  for (const [versionIndex, { files, version }] of versionFiles.entries()) {
    console.log(styleText("bold", `${version}/`));

    const contents = contentsByVersion[versionIndex] ?? [];

    for (const [index, file] of files.entries()) {
      try {
        const data = JSON.parse(contents[index] ?? "") as Record<
          string,
          unknown
        >;
        console.log(`  ✓ ${file}: ${Object.keys(data).length} tokens`);
      } catch {
        console.log(styleText("red", `  ✗ ${file}: parse error`));
      }
    }
    console.log("");
  }

  console.log(
    styleText("green", "✅ Audit complete. Ready to build token pipeline.")
  );
};
