import { resolveTokens } from "../lib/resolver";
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

  const validation = validateLightDarkTokens(
    resolved.tokens,
    resolvedDark.tokens
  );

  printSection("Validators (light)");
  printSummary(
    "Schema",
    validation.schema.isValid,
    validation.schema.errors.length
  );
  printSummary(
    "References",
    validation.refs.isValid,
    validation.refs.errors.length
  );
  printSummary(
    "Contrast",
    validation.contrast.isValid,
    validation.contrast.errors.length
  );
  printSummary(
    "SSR safety",
    validation.ssrSafety.isValid,
    validation.ssrSafety.errors.length
  );

  printSection("Validators (dark)");
  printSummary(
    "Schema",
    validation.darkSchema.isValid,
    validation.darkSchema.errors.length
  );
  printSummary(
    "References",
    validation.darkRefs.isValid,
    validation.darkRefs.errors.length
  );
  printSummary(
    "Contrast",
    validation.darkContrast.isValid,
    validation.darkContrast.errors.length
  );
  printSummary(
    "SSR safety",
    validation.darkSsrSafety.isValid,
    validation.darkSsrSafety.errors.length
  );

  const totalErrors = countValidationErrors(
    validation,
    resolved.errors.length,
    resolvedDark.errors.length
  );

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
