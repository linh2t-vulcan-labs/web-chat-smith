import type { TokenMap } from "../resolver";
import {
  extractRefPath,
  flattenTokenMap,
  isObjectRecord,
  isTokenValue,
} from "../utils/token-tree";

export interface RefValidationError {
  code: "unresolved_ref" | "invalid_ref_format" | "self_ref";
  message: string;
  ref: string;
  tokenPath: string;
}

export interface RefValidationResult {
  errors: RefValidationError[];
  isValid: boolean;
}

const walkRefs = (
  current: TokenMap,
  availablePaths: Set<string>,
  errors: RefValidationError[],
  parentPath = ""
): void => {
  const validateReference = (ref: string, tokenPath: string): void => {
    if (ref === tokenPath) {
      errors.push({
        code: "self_ref",
        message: `Token ${tokenPath} references itself`,
        ref,
        tokenPath,
      });
      return;
    }

    if (!availablePaths.has(ref)) {
      errors.push({
        code: "unresolved_ref",
        message: `Token ${tokenPath} references unknown token ${ref}`,
        ref,
        tokenPath,
      });
    }
  };

  const walkValueReferences = (value: unknown, tokenPath: string): void => {
    if (typeof value === "string") {
      const ref = extractRefPath(value);
      if (ref) {
        validateReference(ref, tokenPath);
      }
      return;
    }

    if (!isObjectRecord(value)) {
      return;
    }

    for (const nested of Object.values(value)) {
      walkValueReferences(nested, tokenPath);
    }
  };

  for (const [key, value] of Object.entries(current)) {
    const tokenPath = parentPath ? `${parentPath}.${key}` : key;

    if (isTokenValue(value)) {
      walkValueReferences(value.$value, tokenPath);

      continue;
    }

    if (isObjectRecord(value) && !isTokenValue(value)) {
      walkRefs(value as TokenMap, availablePaths, errors, tokenPath);
    }
  }
};

export const validateRefs = (tokens: TokenMap): RefValidationResult => {
  const paths = new Set(flattenTokenMap(tokens).map((entry) => entry.path));
  const errors: RefValidationError[] = [];

  walkRefs(tokens, paths, errors);

  return {
    errors,
    isValid: errors.length === 0,
  };
};
