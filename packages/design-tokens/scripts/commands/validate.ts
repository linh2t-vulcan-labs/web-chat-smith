import { resolveTokens } from "../lib/resolver";
import { styleText } from "../lib/utils/console-colors";
import {
  validateContrast,
  validateRefs,
  validateSchema,
  validateSSRSafety,
} from "../lib/validators";
import {
  FIGMA_TOKENS_DIR,
  listVersions,
  readCurrentVersion,
} from "../lib/version";

const printSection = (title: string): void => {
  console.log(styleText("cyan", `\n${title}`));
};

const printSummary = (
  title: string,
  isValid: boolean,
  errorCount: number
): void => {
  const status = isValid
    ? styleText("green", "PASS")
    : styleText("red", "FAIL");
  console.log(`${title}: ${status} (${errorCount} errors)`);
};

const validateVersion = async (version: string): Promise<number> => {
  printSection("Design Tokens Validation");
  console.log(`Version: ${version}`);

  const [resolved, resolvedDark] = await Promise.all([
    resolveTokens(FIGMA_TOKENS_DIR, version, "light"),
    resolveTokens(FIGMA_TOKENS_DIR, version, "dark"),
  ]);

  printSection("Resolver (light)");
  console.log(`Files: ${resolved.metadata.fileCount}`);
  console.log(`Total tokens: ${resolved.metadata.totalTokenCount}`);
  console.log(`Unresolved refs: ${resolved.metadata.unresolvedCount}`);

  printSection("Resolver (dark)");
  console.log(`Total tokens: ${resolvedDark.metadata.totalTokenCount}`);
  console.log(`Unresolved refs: ${resolvedDark.metadata.unresolvedCount}`);

  const schema = validateSchema(resolved.tokens);
  const refs = validateRefs(resolved.tokens);
  const contrast = validateContrast(resolved.tokens);
  const ssrSafety = validateSSRSafety(resolved.tokens);
  const darkSchema = validateSchema(resolvedDark.tokens);
  const darkRefs = validateRefs(resolvedDark.tokens);
  const darkContrast = validateContrast(resolvedDark.tokens);
  const darkSsrSafety = validateSSRSafety(resolvedDark.tokens);

  printSection("Validators (light)");
  printSummary("Schema", schema.isValid, schema.errors.length);
  printSummary("References", refs.isValid, refs.errors.length);
  printSummary("Contrast", contrast.isValid, contrast.errors.length);
  printSummary("SSR safety", ssrSafety.isValid, ssrSafety.errors.length);

  printSection("Validators (dark)");
  printSummary("Schema", darkSchema.isValid, darkSchema.errors.length);
  printSummary("References", darkRefs.isValid, darkRefs.errors.length);
  printSummary("Contrast", darkContrast.isValid, darkContrast.errors.length);
  printSummary(
    "SSR safety",
    darkSsrSafety.isValid,
    darkSsrSafety.errors.length
  );

  const totalErrors =
    resolved.errors.length +
    resolvedDark.errors.length +
    schema.errors.length +
    refs.errors.length +
    contrast.errors.length +
    ssrSafety.errors.length +
    darkSchema.errors.length +
    darkRefs.errors.length +
    darkContrast.errors.length +
    darkSsrSafety.errors.length;

  printSection("Result");
  console.log(
    totalErrors > 0
      ? styleText("red", `Validation failed with ${totalErrors} errors`)
      : styleText("green", "Validation passed with 0 errors")
  );

  return totalErrors;
};

const resolveTargetVersions = async (args: string[]): Promise<string[]> => {
  if (args.includes("--all")) {
    return listVersions();
  }

  const explicit = args.find((arg) => !arg.startsWith("--"));
  return [explicit ?? (await readCurrentVersion())];
};

export const run = async (args: string[]): Promise<void> => {
  const versions = await resolveTargetVersions(args);
  const errorCounts = await Promise.all(
    versions.map((version) => validateVersion(version))
  );
  const totalErrors = errorCounts.reduce((sum, count) => sum + count, 0);

  if (totalErrors > 0) {
    throw new Error(
      `Validation failed with ${totalErrors} total error(s) across ${versions.length} version(s)`
    );
  }
};
