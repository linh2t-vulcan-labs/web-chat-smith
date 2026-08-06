import type { TokenMap, TokenValue } from "../resolver";
import {
  collectFromValue,
  extractRefPath,
  flattenTokenMap,
  walkTokenTree,
} from "../utils/token-tree";

interface RefValidationError {
  code: "unresolved_ref" | "invalid_ref_format" | "self_ref";
  message: string;
  ref: string;
  tokenPath: string;
}

interface RefValidationResult {
  errors: RefValidationError[];
  isValid: boolean;
}

const collectRefsFromValue = (value: TokenValue["$value"]): string[] =>
  collectFromValue(value, (leaf) => {
    const ref = extractRefPath(leaf);
    return ref ? [ref] : [];
  });

const validateReference = (
  ref: string,
  tokenPath: string,
  availablePaths: Set<string>,
  errors: RefValidationError[]
): void => {
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

export const validateRefs = (tokens: TokenMap): RefValidationResult => {
  const availablePaths = new Set(
    flattenTokenMap(tokens).map((entry) => entry.path)
  );
  const errors: RefValidationError[] = [];

  walkTokenTree(tokens, (token, tokenPath) => {
    for (const ref of collectRefsFromValue(token.$value)) {
      validateReference(ref, tokenPath, availablePaths, errors);
    }
  });

  return {
    errors,
    isValid: errors.length === 0,
  };
};
