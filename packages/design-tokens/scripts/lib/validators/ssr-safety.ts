import type { TokenMap } from "../resolver";
import { isObjectRecord, isTokenValue } from "../utils/token-tree";

const SSR_UNSAFE_PATTERN =
  /(?<unsafeUsage>window\.|document\.|matchMedia\(|innerWidth|innerHeight)/iu;

export interface SSRSafetyValidationError {
  code: "ssr_unsafe_value";
  message: string;
  tokenPath: string;
  unsafeSnippet: string;
}

export interface SSRSafetyValidationResult {
  errors: SSRSafetyValidationError[];
  isValid: boolean;
}

const serializeValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
};

const walkSSR = (
  current: TokenMap,
  errors: SSRSafetyValidationError[],
  parentPath = ""
): void => {
  for (const [key, value] of Object.entries(current)) {
    const tokenPath = parentPath ? `${parentPath}.${key}` : key;

    if (isTokenValue(value)) {
      const serialized = serializeValue(value.$value);
      const matched = serialized.match(SSR_UNSAFE_PATTERN);

      if (matched) {
        errors.push({
          code: "ssr_unsafe_value",
          message: `Token ${tokenPath} contains SSR-unsafe runtime usage`,
          tokenPath,
          unsafeSnippet: matched[0],
        });
      }

      continue;
    }

    if (isObjectRecord(value)) {
      walkSSR(value as TokenMap, errors, tokenPath);
    }
  }
};

export const validateSSRSafety = (
  tokens: TokenMap
): SSRSafetyValidationResult => {
  const errors: SSRSafetyValidationError[] = [];
  walkSSR(tokens, errors);

  return {
    errors,
    isValid: errors.length === 0,
  };
};
