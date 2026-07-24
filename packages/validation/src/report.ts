// @cs/validation/report — formats zod issues into a human-readable, multi-line
// report. Shared by every package that validates external data at a
// trust boundary: @cs/env (env var validation) and @cs/api-client (backend
// response schema-drift diagnostics) both need "what failed and why", not
// just a boolean.
export interface ZodIssueLike {
  path: PropertyKey[];
  message: string;
}

/** Dot-joined path for a zod issue, e.g. `["user", "email"]` -> `"user.email"`. Empty path -> `"(root)"`. */
export const formatIssuePath = (path: PropertyKey[]): string =>
  path.length === 0 ? "(root)" : path.map(String).join(".");

export interface FormatIssuesReportOptions {
  title: string;
  /**
   * Override the per-issue line — use when the caller needs to redact a
   * sensitive value or add context (@cs/env's `parseEntries` does both).
   * Defaults to `"  - {path}: {message}"`.
   */
  formatLine?: (issue: ZodIssueLike, path: string) => string;
}

const defaultFormatLine = (issue: ZodIssueLike, path: string): string =>
  `  - ${path}: ${issue.message}`;

export const formatIssuesReport = (
  issues: readonly ZodIssueLike[],
  { title, formatLine = defaultFormatLine }: FormatIssuesReportOptions
): string => {
  const lines = issues.map((issue) =>
    formatLine(issue, formatIssuePath(issue.path))
  );
  return `${title}:\n${lines.join("\n")}`;
};
