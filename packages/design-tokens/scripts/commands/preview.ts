import path from "node:path";

import { flattenTokens } from "../lib/generators";
import { normalizeAll } from "../lib/normalizers";
import {
  TOKEN_PREVIEW_FILENAME,
  writeTokenPreview,
} from "../lib/preview-gallery";
import { resolveTokens } from "../lib/resolver";
import { styleText } from "../lib/utils/console-colors";
import {
  FIGMA_TOKENS_DIR,
  readCurrentVersion,
  versionDir,
} from "../lib/version";

/** Read-only: writes `_preview.html` for a token version — swatches for
 * colors, a value table for everything else (spacing, radius, typography,
 * shadows, borders). Doesn't touch generated-token/ (that's `build`). */
export const run = async (args: string[]): Promise<void> => {
  const version = args[0] ?? (await readCurrentVersion());

  const [resolved, resolvedDark] = await Promise.all([
    resolveTokens(FIGMA_TOKENS_DIR, version, "light"),
    resolveTokens(FIGMA_TOKENS_DIR, version, "dark"),
  ]);

  if (resolved.errors.length > 0 || resolvedDark.errors.length > 0) {
    console.log(
      styleText(
        "yellow",
        `${resolved.errors.length + resolvedDark.errors.length} resolver errors — preview may be incomplete.`
      )
    );
  }

  const flatLight = flattenTokens(normalizeAll(resolved.tokens));
  const flatDark = flattenTokens(normalizeAll(resolvedDark.tokens));

  await writeTokenPreview(versionDir(version), version, flatLight, flatDark);

  console.log(styleText("green", `${flatLight.length} tokens`));
  console.log(
    `Open ${path.join(versionDir(version), TOKEN_PREVIEW_FILENAME)} to see them all.`
  );
};
