import { migrateLegacyClassToken } from "./mappings";

export interface TransformDetail {
  count: number;
  from: string;
  to: string;
}

export interface TransformResult {
  code: string;
  transforms: TransformDetail[];
}

const CLASS_ATTR_PATTERN =
  /\bclass(?:Name)?\s*=\s*(?<quote>["'`])(?<classText>[\s\S]*?)\k<quote>/gu;

const CLASS_CALL_PATTERN =
  /\b(?:cva|cn|clsx|twMerge)\(\s*(?<quote>["'`])(?<classText>[\s\S]*?)\k<quote>/gu;

const CLASS_TOKEN_PATTERN = /[^\s]+/gu;

const applyClassMigration = (classText: string): TransformResult => {
  const transformCounter = new Map<string, TransformDetail>();

  const migrated = classText.replaceAll(CLASS_TOKEN_PATTERN, (token) => {
    const mapped = migrateLegacyClassToken(token);
    if (!mapped) {
      return token;
    }

    const key = `${token}→${mapped}`;
    const existing = transformCounter.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      transformCounter.set(key, {
        count: 1,
        from: token,
        to: mapped,
      });
    }

    return mapped;
  });

  return {
    code: migrated,
    transforms: [...transformCounter.values()],
  };
};

const transformMatches = (
  source: string,
  pattern: RegExp,
  aggregate: Map<string, TransformDetail>
): string =>
  source.replaceAll(pattern, (fullMatch, quote, classText) => {
    const transformed = applyClassMigration(classText);

    if (transformed.transforms.length === 0) {
      return fullMatch;
    }

    for (const change of transformed.transforms) {
      const key = `${change.from}→${change.to}`;
      const existing = aggregate.get(key);
      if (existing) {
        existing.count += change.count;
      } else {
        aggregate.set(key, { ...change });
      }
    }

    return fullMatch.replace(classText, transformed.code);
  });

export const transformTokenSource = (source: string): TransformResult => {
  const aggregate = new Map<string, TransformDetail>();
  const afterAttributes = transformMatches(
    source,
    CLASS_ATTR_PATTERN,
    aggregate
  );
  const afterUtilityCalls = transformMatches(
    afterAttributes,
    CLASS_CALL_PATTERN,
    aggregate
  );

  return {
    code: afterUtilityCalls,
    transforms: [...aggregate.values()].toSorted((a, b) =>
      a.from.localeCompare(b.from)
    ),
  };
};
