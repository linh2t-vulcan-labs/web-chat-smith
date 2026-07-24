import type { FlagsEngine } from "../core/engine";
import type { FlagSchema } from "../schema";
import type { ExperimentDefinition } from "./types";

/**
 * Resolves an experiment against a live engine: reads the raw flag, decodes
 * it, and guards against a `decode` implementation returning something
 * outside `variants` (falls back to `defaultVariant`).
 */
export const resolveExperiment = <
  TSchema extends FlagSchema,
  TRawKey extends keyof TSchema & string,
  TVariant extends string,
>(
  engine: FlagsEngine<TSchema>,
  definition: ExperimentDefinition<TSchema, TRawKey, TVariant>
): TVariant => {
  const raw = engine.getValue(definition.key);
  const variant = definition.decode(raw);
  return (definition.variants as readonly string[]).includes(variant)
    ? variant
    : definition.defaultVariant;
};
