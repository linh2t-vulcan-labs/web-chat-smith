/**
 * Error Reporter
 *
 * Formats and reports token resolution errors with context,
 * suggestions, and color-coded terminal output.
 */

import { styleText } from "./utils/console-colors";

export interface ErrorReport {
  level: "error" | "warning";
  type: string;
  message: string;
  context?: string;
  suggestion?: string;
  file?: string;
  token?: string;
}

export class ErrorReporter {
  private errors: ErrorReport[] = [];

  addError(error: ErrorReport): void {
    this.errors.push(error);
  }

  addErrors(errors: ErrorReport[]): void {
    this.errors.push(...errors);
  }

  hasErrors(): boolean {
    return this.errors.some((e) => e.level === "error");
  }

  hasWarnings(): boolean {
    return this.errors.some((e) => e.level === "warning");
  }

  format(): string {
    if (this.errors.length === 0) {
      return styleText("green", "✅ No errors found");
    }

    const lines: string[] = [];

    // Count errors and warnings
    const errorCount = this.errors.filter((e) => e.level === "error").length;
    const warningCount = this.errors.filter(
      (e) => e.level === "warning"
    ).length;

    if (errorCount > 0) {
      lines.push(
        styleText(
          "red",
          `❌ ${errorCount} error${errorCount > 1 ? "s" : ""} found`
        )
      );
    }
    if (warningCount > 0) {
      lines.push(
        styleText(
          "yellow",
          `⚠️  ${warningCount} warning${warningCount > 1 ? "s" : ""} found`
        )
      );
    }

    lines.push("");

    // Group errors by type
    const byType = new Map<string, ErrorReport[]>();
    for (const error of this.errors) {
      if (!byType.has(error.type)) {
        byType.set(error.type, []);
      }
      byType.get(error.type)?.push(error);
    }

    // Format each group
    for (const [type, errors] of byType) {
      lines.push(styleText("bold", type));
      for (const error of errors) {
        const prefix =
          error.level === "error"
            ? styleText("red", "  ✗")
            : styleText("yellow", "  ⚠");

        lines.push(`${prefix} ${error.message}`);

        if (error.file) {
          lines.push(`    ${styleText("cyan", `File: ${error.file}`)}`);
        }
        if (error.token) {
          lines.push(`    ${styleText("cyan", `Token: ${error.token}`)}`);
        }
        if (error.context) {
          lines.push(`    ${styleText("gray", `Context: ${error.context}`)}`);
        }
        if (error.suggestion) {
          lines.push(
            `    ${styleText("green", `💡 Suggestion: ${error.suggestion}`)}`
          );
        }
        lines.push("");
      }
    }

    return lines.join("\n");
  }

  log(): void {
    console.log(this.format());
  }

  getErrors(): ErrorReport[] {
    return this.errors.filter((e) => e.level === "error");
  }

  getWarnings(): ErrorReport[] {
    return this.errors.filter((e) => e.level === "warning");
  }

  clear(): void {
    this.errors = [];
  }
}

/**
 * Levenshtein distance for string similarity
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix: number[][] = Array.from({ length: len2 + 1 }, () =>
    Array.from({ length: len1 + 1 }, () => 0)
  );
  const [firstRow] = matrix;

  for (let i = 0; i <= len1; i += 1) {
    if (!firstRow) {
      continue;
    }
    firstRow[i] = i;
  }
  for (let j = 0; j <= len2; j += 1) {
    const row = matrix[j];
    if (!row) {
      continue;
    }
    row[0] = j;
  }

  for (let j = 1; j <= len2; j += 1) {
    const row = matrix[j];
    const prevRow = matrix[j - 1];

    if (!row || !prevRow) {
      continue;
    }

    for (let i = 1; i <= len1; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      const deletion = (row[i - 1] ?? 0) + 1;
      const insertion = (prevRow[i] ?? 0) + 1;
      const substitution = (prevRow[i - 1] ?? 0) + indicator;

      // eslint-disable-next-line unicorn/no-nested-ternary
      row[i] = Math.min(deletion, insertion, substitution);
    }
  }

  return matrix[len2]?.[len1] ?? 0;
};

/**
 * Create common error suggestions based on token path
 */
export const suggestAlternative = (
  missingRef: string,
  availableTokens: string[]
): string | null => {
  const maxDistance = missingRef.length / 2;
  const candidates: { distance: number; token: string }[] = [];

  for (const token of availableTokens) {
    const distance = levenshteinDistance(missingRef, token);
    if (distance < maxDistance) {
      candidates.push({ distance, token });
    }
  }

  candidates.sort((a, b) => a.distance - b.distance);
  candidates.splice(3);

  if (candidates.length === 0) {
    return null;
  }

  if (candidates.length === 1) {
    const [firstCandidate] = candidates;
    if (!firstCandidate) {
      return null;
    }

    return `Did you mean "$${firstCandidate.token}"?`;
  }

  const suggestions = candidates.map((c) => `$${c.token}`).join(", ");
  return `Did you mean one of: ${suggestions}?`;
};
