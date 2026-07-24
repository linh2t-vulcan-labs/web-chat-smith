/**
 * Where a raw value came from. Mirrors Firebase Remote Config's `Value`
 * source, but any adapter can produce it — nothing here mentions Firebase.
 *
 * `"static"` means neither a fetched nor a configured default value exists
 * for the key, so the schema's default should win.
 */
export type FlagSource = "default" | "remote" | "static";

/**
 * A single raw value read from the underlying provider, already isolated
 * from that provider's SDK types. Adapters are the only code that produces
 * these — everything downstream is provider-agnostic.
 */
export interface RawFlagValue {
  source: FlagSource;
  asBoolean: () => boolean;
  asString: () => string;
  asNumber: () => number;
}

/** Where an error happened, so `onError` handlers can log useful context. */
export interface FlagsErrorContext {
  phase: "get" | "get_web_feature" | "init";
  key?: string;
}

/**
 * The provider boundary. To support a new backend (LaunchDarkly, a config
 * file, ...) implement this interface — nothing else in the package needs to
 * change.
 */
export interface FlagAdapter {
  /** Fetch/activate remote values. Should not throw — engine wraps it anyway. */
  init: () => Promise<void>;
  getRawValue: (key: string) => RawFlagValue;
}
