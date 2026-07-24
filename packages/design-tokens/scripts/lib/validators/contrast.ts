import type { TokenMap } from "../resolver";
import {
  getContrastRatio,
  isHexColor,
  normalizeHexColor,
} from "../utils/color-math";
import { flattenTokenMap } from "../utils/token-tree";

export interface ContrastValidationError {
  bgPath: string;
  bgValue: string;
  code: "low_contrast";
  contrastRatio: number;
  message: string;
  textPath: string;
  textValue: string;
}

export interface ContrastValidationResult {
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

const collectColorTokens = (tokens: TokenMap): Map<string, string> => {
  const output = new Map<string, string>();

  for (const entry of flattenTokenMap(tokens)) {
    const { $type, $value } = entry.token;

    if ($type === "color" && typeof $value === "string" && isHexColor($value)) {
      output.set(entry.path, normalizeHexColor($value));
    }
  }

  return output;
};

export const validateContrast = (
  tokens: TokenMap
): ContrastValidationResult => {
  const errors: ContrastValidationError[] = [];
  const tokenValues = collectColorTokens(tokens);

  for (const pair of CONTRAST_PAIRS) {
    const textValue = tokenValues.get(pair.textPath);
    const bgValue = tokenValues.get(pair.bgPath);

    if (!textValue || !bgValue) {
      continue;
    }

    const ratio = getContrastRatio(textValue, bgValue);
    if (ratio < pair.minRatio) {
      errors.push({
        bgPath: pair.bgPath,
        bgValue,
        code: "low_contrast",
        contrastRatio: Number(ratio.toFixed(2)),
        message: `Low contrast between ${pair.textPath} and ${pair.bgPath}`,
        textPath: pair.textPath,
        textValue,
      });
    }
  }

  return {
    errors,
    isValid: errors.length === 0,
  };
};
