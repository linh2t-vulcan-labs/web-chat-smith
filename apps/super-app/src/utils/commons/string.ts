import { camelCase, snakeCase } from "@/libs/lodash-es";

import { safeJsonParse } from "./helpers";

export const formattedTitle = (title: string) => title.replaceAll('"', "");

export const formattedSuggestion = (suggestion: string) => {
  const jsonText = suggestion.replaceAll(/(?<fence>^```json\n|```$)/gu, "");
  const { predictions } = safeJsonParse<{ predictions: string[] }>(
    jsonText
  ) || {
    predictions: [],
  };
  return predictions;
};

// const extractSuffix = (input: string, prefix: string): string => {
//   const fullPrefix = `${prefix}.`;
//   return input.startsWith(fullPrefix) ? input.slice(fullPrefix.length) : input;
// };

export const extractCurrencyCode = (value: string): string => {
  const parts = value.split("_");
  return parts.at(-1) ?? "";
};

export function toCamelCase(str: string): string {
  return camelCase(str);
}

function toSnakeCase(str: string): string {
  return snakeCase(str);
}

export function keysToCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(keysToCamelCase);
  }

  if (obj !== null && typeof obj === "object") {
    const acc: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      acc[toCamelCase(key)] = keysToCamelCase(value);
    }
    return acc;
  }

  return obj;
}

export function keysToSnakeCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(keysToSnakeCase);
  }

  if (obj !== null && typeof obj === "object") {
    const acc: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      acc[toSnakeCase(key)] = keysToSnakeCase(value);
    }
    return acc;
  }

  return obj;
}

export function isNotEmptyInput(input: string): boolean {
  return input.trim().length > 0;
}
