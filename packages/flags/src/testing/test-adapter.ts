import type { FlagAdapter, FlagSource, RawFlagValue } from "../core/types";

/**
 * An in-memory {@link FlagAdapter} for tests: `values` holds the raw text
 * Firebase would return, `source` controls whether reads look "remote",
 * "default", or "static" (unset).
 */
export const createTestAdapter = (
  values: Record<string, { source: FlagSource; raw: string }>,
  options: { failInit?: boolean; failKeys?: string[] } = {}
): FlagAdapter => ({
  getRawValue: (key: string): RawFlagValue => {
    if (options.failKeys?.includes(key)) {
      throw new Error(`boom: ${key}`);
    }
    const entry = values[key];
    const raw = entry?.raw ?? "";
    const source = entry?.source ?? "static";
    return {
      asBoolean: () => raw === "true",
      asNumber: () => Number(raw),
      asString: () => raw,
      source,
    };
  },
  init: async () => {
    if (options.failInit) {
      throw new Error("init failed");
    }
    await Promise.resolve();
  },
});
