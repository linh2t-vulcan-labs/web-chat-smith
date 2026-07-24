const COMBINING_MARKS_REGEX = /[\u0300-\u036F]/gu;
const DOT_SEPARATOR_REGEX = /\./gu;
const MULTI_DASH_REGEX = /-+/gu;
const NON_SAFE_CHAR_REGEX = /[^A-Za-z\d_-]+/gu;
const WHITESPACE_REGEX = /\s+/gu;

const sanitizeNamePart = (value: string): string =>
  value
    .normalize("NFKD")
    .replaceAll(COMBINING_MARKS_REGEX, "")
    .replaceAll(WHITESPACE_REGEX, "-")
    .replaceAll(NON_SAFE_CHAR_REGEX, "-")
    .replaceAll(MULTI_DASH_REGEX, "-")
    .replaceAll(/^-|-$/gu, "");

export const tokenPathToSegments = (path: string): string[] =>
  path
    .replaceAll(DOT_SEPARATOR_REGEX, "-")
    .split("-")
    .map((segment) => sanitizeNamePart(segment))
    .filter((segment) => segment.length > 0);

export const tokenPathToSafeName = (path: string): string => {
  const segments = tokenPathToSegments(path);
  return segments.length > 0 ? segments.join("-") : "token";
};

export const tokenPathToCssVar = (path: string, prefix = "--cs"): string =>
  `${prefix}-${tokenPathToSafeName(path)}`;
