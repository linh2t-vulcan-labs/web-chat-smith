import type { TokenMap, TokenValue } from "../resolver";

export interface SchemaValidationError {
  code: "missing_type" | "invalid_type" | "missing_value" | "invalid_value";
  message: string;
  tokenPath: string;
}

export interface SchemaValidationResult {
  errors: SchemaValidationError[];
  isValid: boolean;
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isTokenValue = (value: unknown): value is TokenValue =>
  isObjectRecord(value) && "$value" in value;

const isValidTokenType = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isValidTokenValue = (
  value: unknown
): value is string | number | Record<string, unknown> => {
  if (typeof value === "string") {
    return value.length > 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value);
  }

  return isObjectRecord(value);
};

const walkSchema = (
  current: TokenMap,
  parentPath: string,
  errors: SchemaValidationError[]
): void => {
  for (const [key, value] of Object.entries(current)) {
    const tokenPath = parentPath ? `${parentPath}.${key}` : key;

    if (isTokenValue(value)) {
      if (!("$type" in value)) {
        errors.push({
          code: "missing_type",
          message: `Token ${tokenPath} is missing $type`,
          tokenPath,
        });
        continue;
      }

      if (!isValidTokenType(value.$type)) {
        errors.push({
          code: "invalid_type",
          message: `Token ${tokenPath} has invalid $type`,
          tokenPath,
        });
      }

      if (!isValidTokenValue(value.$value)) {
        errors.push({
          code: "invalid_value",
          message: `Token ${tokenPath} has invalid $value`,
          tokenPath,
        });
      }

      continue;
    }

    if (isObjectRecord(value)) {
      walkSchema(value as TokenMap, tokenPath, errors);
      continue;
    }

    errors.push({
      code: "missing_value",
      message: `Token node ${tokenPath} is not a valid token object`,
      tokenPath,
    });
  }
};

export const validateSchema = (tokens: TokenMap): SchemaValidationResult => {
  const errors: SchemaValidationError[] = [];
  walkSchema(tokens, "", errors);

  return {
    errors,
    isValid: errors.length === 0,
  };
};
