import type { FlagSchema, FlagValue } from "../schema";
import { FLAG_DECODERS } from "./parsers";
import type { FlagAdapter, FlagsErrorContext } from "./types";

export type FlagOverrides<TSchema extends FlagSchema> = Partial<{
  [K in keyof TSchema]: FlagValue<TSchema, K>;
}>;

export interface CreateFlagsEngineOptions<TSchema extends FlagSchema> {
  adapter: FlagAdapter;
  schema: TSchema;
  /**
   * Initial local overrides, applied on top of every read. Pass `{}` in
   * production and your dev-override map otherwise — the decision belongs to
   * the caller, not this package.
   */
  initialOverrides?: FlagOverrides<TSchema>;
  /** Called on any caught error. The engine never throws for these. */
  onError?: (error: unknown, context: FlagsErrorContext) => void;
}

export interface FlagsEngine<TSchema extends FlagSchema> {
  readonly initialized: boolean;

  /** Fetches/activates remote values. Never throws — falls back to defaults. */
  init: () => Promise<void>;

  /** Subscribes to changes (init completing, or an override being set). */
  subscribe: (listener: () => void) => () => void;

  /** The single typed getter — decoder and default come from the schema. */
  getValue: <K extends keyof TSchema & string>(key: K) => FlagValue<TSchema, K>;

  /** Escape hatch: the adapter's raw value for `key`, decoders bypassed. */
  getRawValue: (key: string) => unknown;

  setOverride: <K extends keyof TSchema & string>(
    key: K,
    value: FlagValue<TSchema, K>
  ) => void;
  clearOverrides: () => void;
}

/**
 * Creates a typed, fail-safe flags engine from a {@link FlagAdapter} and a
 * {@link FlagSchema}. Every key shares the same getter path — no per-type
 * duplication, no `typeof`-based dispatch: the schema's `decoder` is looked
 * up once in {@link FLAG_DECODERS}.
 */
export const createFlagsEngine = <TSchema extends FlagSchema>(
  options: CreateFlagsEngineOptions<TSchema>
): FlagsEngine<TSchema> => {
  const { adapter, schema, onError } = options;
  const overrides = new Map<string, unknown>(
    Object.entries(options.initialOverrides ?? {})
  );
  const listeners = new Set<() => void>();

  let initialized = false;

  const notify = (): void => {
    for (const listener of listeners) {
      listener();
    }
  };

  const report = (error: unknown, context: FlagsErrorContext): void => {
    onError?.(error, context);
  };

  const init = async (): Promise<void> => {
    try {
      await adapter.init();
    } catch (error) {
      report(error, { phase: "init" });
    } finally {
      initialized = true;
      notify();
    }
  };

  const subscribe = (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const getValue = <K extends keyof TSchema & string>(
    key: K
  ): FlagValue<TSchema, K> => {
    if (overrides.has(key)) {
      return overrides.get(key) as FlagValue<TSchema, K>;
    }
    const entry = schema[key] as TSchema[K];
    try {
      const raw = adapter.getRawValue(key);
      if (raw.source === "static") {
        return entry.defaultValue;
      }
      const decode = FLAG_DECODERS[entry.decoder] as (
        rawValue: Parameters<(typeof FLAG_DECODERS)[typeof entry.decoder]>[0],
        fallback: unknown
      ) => unknown;
      return decode(raw, entry.defaultValue) as FlagValue<TSchema, K>;
    } catch (error) {
      report(error, { key, phase: "get" });
      return entry.defaultValue;
    }
  };

  const getRawValue = (key: string): unknown => adapter.getRawValue(key);

  const setOverride = <K extends keyof TSchema & string>(
    key: K,
    value: FlagValue<TSchema, K>
  ): void => {
    overrides.set(key, value);
    notify();
  };

  const clearOverrides = (): void => {
    overrides.clear();
    notify();
  };

  return {
    clearOverrides,
    getRawValue,
    getValue,
    init,
    get initialized() {
      return initialized;
    },
    setOverride,
    subscribe,
  };
};
