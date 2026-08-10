const HTML_SPECIAL_CHARS = /[&<>"]/gu;
const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

export const escapeHtml = (value: string): string =>
  value.replace(HTML_SPECIAL_CHARS, (char) => HTML_ESCAPES[char] ?? char);
