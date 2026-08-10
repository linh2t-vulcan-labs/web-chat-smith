import path from "node:path";

import { $ } from "bun";

import {
  flattenTokens,
  generateDarkModeCss,
  generateIndexCss,
  generateManifest,
  generateModeOverridesCss,
  generateRecipeCss,
  generateShadcnBridgeCss,
  generateShadowsCss,
  generateTokensCss,
  generateTypographyCss,
} from "../lib/generators";
import { normalizeAll } from "../lib/normalizers";
import { resolveTokens } from "../lib/resolver";
import type { TokenMap } from "../lib/resolver";
import { styleText } from "../lib/utils/console-colors";
import {
  countValidationErrors,
  validateLightDarkTokens,
} from "../lib/validators";
import {
  FIGMA_TOKENS_DIR,
  listVersions,
  readCurrentVersion,
} from "../lib/version";

const { resolve } = path;

const OUTPUT_ROOT = resolve(import.meta.dir, "../../generated-token");

const parseTokenFile = async (
  version: string,
  fileName: string
): Promise<TokenMap | undefined> => {
  const file = Bun.file(resolve(FIGMA_TOKENS_DIR, version, fileName));

  if (!(await file.exists())) {
    return undefined;
  }

  const parsed = JSON.parse(await file.text()) as unknown;
  if (typeof parsed !== "object" || parsed === null) {
    return undefined;
  }

  return parsed as TokenMap;
};

const buildVersion = async (version: string): Promise<void> => {
  const outputDir = resolve(OUTPUT_ROOT, version);

  console.log(styleText("cyan", `Building design tokens for ${version}...`));

  const [resolved, resolvedDark] = await Promise.all([
    resolveTokens(FIGMA_TOKENS_DIR, version, "light"),
    resolveTokens(FIGMA_TOKENS_DIR, version, "dark"),
  ]);
  const normalized = normalizeAll(resolved.tokens);
  const normalizedDark = normalizeAll(resolvedDark.tokens);

  const validation = validateLightDarkTokens(normalized, normalizedDark);
  const errorCount = countValidationErrors(
    validation,
    resolved.errors.length,
    resolvedDark.errors.length
  );

  if (errorCount > 0) {
    throw new Error(
      `Build failed for ${version} with ${errorCount} validation errors.`
    );
  }

  const flatTokens = flattenTokens(normalized);
  const flatDarkTokens = flattenTokens(normalizedDark);
  const darkModeCss = generateDarkModeCss(flatTokens, flatDarkTokens);
  const modeOverrides = generateModeOverridesCss({
    densityCompact: await parseTokenFile(
      version,
      "primitive_densitive_mode compact.json"
    ),
    densityDefault: await parseTokenFile(
      version,
      "primitive_densitive_mode default.json"
    ),
    densitySpacious: await parseTokenFile(
      version,
      "primitive_densitive_mode spacious.json"
    ),
    deviceDesktop: await parseTokenFile(
      version,
      "primitive_device_mode desktop.json"
    ),
    deviceMobile: await parseTokenFile(
      version,
      "primitive_device_mode mobile.json"
    ),
    deviceTablet: await parseTokenFile(
      version,
      "primitive_device_mode tablet.json"
    ),
  });

  await $`rm -rf ${outputDir} && mkdir -p ${outputDir}`.quiet();

  const tokensCss = `${generateTokensCss(flatTokens)}${modeOverrides}${darkModeCss}`;
  await Promise.all([
    Bun.write(resolve(outputDir, "tokens.css"), tokensCss),
    Bun.write(
      resolve(outputDir, "typography.css"),
      generateTypographyCss(flatTokens)
    ),
    Bun.write(
      resolve(outputDir, "shadows.css"),
      generateShadowsCss(flatTokens)
    ),
    Bun.write(resolve(outputDir, "recipes.css"), generateRecipeCss()),
    Bun.write(resolve(outputDir, "shadcn.css"), generateShadcnBridgeCss()),
    Bun.write(resolve(outputDir, "index.css"), generateIndexCss()),
  ]);

  const manifest = generateManifest(version, flatTokens.length);
  await Bun.write(
    resolve(outputDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`
  );

  console.log(styleText("green", `Build succeeded: ${outputDir}`));
};

export const run = async (args: string[]): Promise<void> => {
  if (args.includes("--all")) {
    await Promise.all(listVersions().map((version) => buildVersion(version)));
    return;
  }

  const explicitVersion = args.find((arg) => !arg.startsWith("--"));
  const version = explicitVersion ?? (await readCurrentVersion());
  await buildVersion(version);
};
