// @cs/env/parse — generic Zod Mini-backed env parsing engine, shared by every
// schema in this package (server secrets in ./index, CS_PUBLIC_* in
// ./schema, Sanity Studio's factory in ./create-env). No schema-specific
// knowledge lives here.
import { formatIssuesReport, z } from "@cs/validation";

import { SECRET_KEYS } from "./constants";

type AnyEnvSchema = z.ZodMiniType;
export type EnvEntries = Record<string, AnyEnvSchema>;
export type InferEntries<T extends EnvEntries> = Readonly<{
  [K in keyof T]: z.infer<T[K]>;
}>;
export type RuntimeEnv = Record<string, string | undefined>;

const REDACTED = "[REDACTED]";

const describeValue = (key: string, source: RuntimeEnv): string => {
  const raw = source[key];
  if (raw === undefined) {
    return "missing";
  }
  if (SECRET_KEYS.has(key)) {
    return REDACTED;
  }
  return `received "${raw}"`;
};

/**
 * `parseEntries` validates a flat object (`z.object({ KEY: schema, ... })`),
 * so every issue's path is exactly one segment — the env var name itself.
 */
const formatIssues = (
  issues: readonly { path: PropertyKey[]; message: string }[],
  label: string,
  source: RuntimeEnv
): string =>
  `${formatIssuesReport(issues, {
    formatLine: (issue, key) => {
      const desc = describeValue(key, source);
      const message =
        source[key] === undefined
          ? `Invalid key: Expected "${key}" but received ${desc}`
          : issue.message;
      return `  - ${key}: ${message} (${desc})`;
    },
    title: `[@cs/env] Invalid ${label} environment variables`,
  })}\n\nFix the variables above and rebuild. See packages/env/README.md.`;

export const parseEntries = <TEntries extends EnvEntries>(
  entries: TEntries,
  source: RuntimeEnv,
  label: string
): InferEntries<TEntries> => {
  const schema = z.object(entries);
  const result = schema.safeParse(source);
  if (!result.success) {
    throw new Error(formatIssues(result.error.issues, label, source));
  }
  return Object.freeze(result.data) as InferEntries<TEntries>;
};

/** Wraps a factory so it only runs once, on first property access, memoized. */
export const lazyEnv = <TValue extends object>(
  factory: () => TValue
): TValue => {
  let cached: TValue | null = null;
  const resolve = (): TValue => {
    if (cached === null) {
      cached = factory();
    }
    return cached;
  };
  return new Proxy(Object.create(null) as TValue, {
    get: (_target, prop) => Reflect.get(resolve(), prop),
    getOwnPropertyDescriptor: (_target, prop) => {
      const descriptor = Object.getOwnPropertyDescriptor(resolve(), prop);
      if (descriptor) {
        descriptor.configurable = true;
      }
      return descriptor;
    },
    has: (_target, prop) => Reflect.has(resolve(), prop),
    ownKeys: () => Reflect.ownKeys(resolve()),
  });
};
