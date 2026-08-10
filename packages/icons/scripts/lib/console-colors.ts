const ANSI_CODES = {
  cyan: "36",
  green: "32",
  red: "31",
  yellow: "33",
} as const;

type AnsiColor = keyof typeof ANSI_CODES;

export const styleText = (color: AnsiColor, text: string): string =>
  `[${ANSI_CODES[color]}m${text}[0m`;
