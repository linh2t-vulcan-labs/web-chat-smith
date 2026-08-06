import type { TokenMap, TokenValue } from "../resolver";
import { walkTokenTree } from "../utils/token-tree";

const SSR_UNSAFE_PATTERN =
  /(?<unsafeUsage>window\.|document\.|matchMedia\(|innerWidth|innerHeight)/iu;

interface SSRSafetyValidationError {
  code: "ssr_unsafe_value";
  message: string;
  tokenPath: string;
  unsafeSnippet: string;
}

interface SSRSafetyValidationResult {
  errors: SSRSafetyValidationError[];
  isValid: boolean;
}

const serializeValue = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  return JSON.stringify(value);
};

const checkTokenSSRSafety = (
  token: TokenValue,
  tokenPath: string,
  errors: SSRSafetyValidationError[]
): void => {
  const serialized = serializeValue(token.$value);
  const matched = serialized.match(SSR_UNSAFE_PATTERN);
  if (!matched) {
    return;
  }

  errors.push({
    code: "ssr_unsafe_value",
    message: `Token ${tokenPath} contains SSR-unsafe runtime usage`,
    tokenPath,
    unsafeSnippet: matched[0],
  });
};

export const validateSSRSafety = (
  tokens: TokenMap
): SSRSafetyValidationResult => {
  const errors: SSRSafetyValidationError[] = [];
  walkTokenTree(tokens, (token, tokenPath) =>
    checkTokenSSRSafety(token, tokenPath, errors)
  );

  return {
    errors,
    isValid: errors.length === 0,
  };
};
