import type { TokenMap } from "../resolver";
import {
  getContrastRatio,
  isHexColor,
  normalizeHexColor,
} from "../utils/color-math";
import type { FlatTokenEntry } from "../utils/token-tree";
import { flattenTokenMap } from "../utils/token-tree";

interface ContrastValidationError {
  bgPath: string;
  bgValue: string;
  code: "low_contrast";
  contrastRatio: number;
  message: string;
  textPath: string;
  textValue: string;
}

interface ContrastValidationResult {
  errors: ContrastValidationError[];
  isValid: boolean;
}

interface ContrastPair {
  bgPath: string;
  minRatio: number;
  textPath: string;
}

const CONTRAST_PAIRS: ContrastPair[] = [
  {
    bgPath: "surface.hierarchy.base",
    minRatio: 7,
    textPath: "text.hierarchy.emphasis",
  },
  {
    bgPath: "surface.hierarchy.base",
    minRatio: 4.5,
    textPath: "text.hierarchy.primary",
  },
  {
    bgPath: "surface.hierarchy.base",
    minRatio: 3,
    textPath: "text.hierarchy.secondary",
  },
  {
    bgPath: "surface.hierarchy.raised",
    minRatio: 4.5,
    textPath: "text.hierarchy.primary",
  },
  {
    bgPath: "surface.hierarchy.raised",
    minRatio: 3,
    textPath: "text.hierarchy.secondary",
  },
  {
    bgPath: "surface.hierarchy.container",
    minRatio: 4.5,
    textPath: "text.hierarchy.primary",
  },
  {
    bgPath: "surface.hierarchy.inverse",
    minRatio: 4.5,
    textPath: "text.hierarchy.inverse",
  },
  {
    bgPath: "surface.hierarchy.toast",
    minRatio: 4.5,
    textPath: "text.hierarchy.inverse",
  },
];

const toNormalizedHexEntry = (
  entry: FlatTokenEntry
): [path: string, hex: string] | null => {
  const { $type, $value } = entry.token;

  if ($type !== "color") {
    return null;
  }

  if (typeof $value !== "string" || !isHexColor($value)) {
    return null;
  }

  return [entry.path, normalizeHexColor($value)];
};

const collectColorTokens = (tokens: TokenMap): Map<string, string> => {
  const entries = flattenTokenMap(tokens)
    .map(toNormalizedHexEntry)
    .filter((entry): entry is [string, string] => entry !== null);

  return new Map(entries);
};

const checkContrastPair = (
  pair: ContrastPair,
  tokenValues: Map<string, string>
): ContrastValidationError | null => {
  const textValue = tokenValues.get(pair.textPath);
  const bgValue = tokenValues.get(pair.bgPath);

  if (!textValue || !bgValue) {
    return null;
  }

  const ratio = getContrastRatio(textValue, bgValue);
  if (ratio >= pair.minRatio) {
    return null;
  }

  return {
    bgPath: pair.bgPath,
    bgValue,
    code: "low_contrast",
    contrastRatio: Number(ratio.toFixed(2)),
    message: `Low contrast between ${pair.textPath} and ${pair.bgPath}`,
    textPath: pair.textPath,
    textValue,
  };
};

export const validateContrast = (
  tokens: TokenMap
): ContrastValidationResult => {
  const tokenValues = collectColorTokens(tokens);
  const errors = CONTRAST_PAIRS.map((pair) =>
    checkContrastPair(pair, tokenValues)
  ).filter((error): error is ContrastValidationError => error !== null);

  return {
    errors,
    isValid: errors.length === 0,
  };
};
