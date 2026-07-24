import type { FLAG_DECODERS } from "./core/parsers";

export type FlagDecoder = keyof typeof FLAG_DECODERS;

export interface FlagSchemaEntry<TValue> {
  decoder: FlagDecoder;
  defaultValue: TValue;
}

export type FlagSchema = Record<string, FlagSchemaEntry<unknown>>;

export type FlagValue<
  TSchema extends FlagSchema,
  TKey extends keyof TSchema,
> = TSchema[TKey]["defaultValue"];

/**
 * Declares the one source of truth for every flag: its decoder (how to read
 * the raw value) and its default (used as the Firebase `defaultConfig` value
 * AND the getter fallback). Consuming apps build one schema and every getter,
 * hook, and type is derived from it — no separate defaults file, no parallel
 * "key -> type" table to keep in sync by hand.
 */
export const defineFlagSchema = <TSchema extends FlagSchema>(
  schema: TSchema
): TSchema => schema;
