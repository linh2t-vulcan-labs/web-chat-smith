import type { FlagSchema } from "../schema";
import type { ExperimentDefinition } from "./types";

/**
 * Curried so `TSchema` can be pinned explicitly at the call site (there's no
 * schema *value* to infer it from — only a key string) while `TRawKey` and
 * `TVariant` are still inferred from the definition object itself.
 *
 * @example
 * const defineAppExperiment = defineExperiment<typeof flagSchema>();
 * export const subscriptionUiExperiment = defineAppExperiment({
 *   key: "subscriptionUiVersion",
 *   variants: ["tier1", "tier2", "tier3"],
 *   defaultVariant: "tier1",
 *   decode: (raw) => TIER_BY_OFFSET[(raw - 6) % 3] ?? "tier1",
 * });
 */
export const defineExperiment =
  <TSchema extends FlagSchema>() =>
  <TRawKey extends keyof TSchema & string, TVariant extends string>(
    definition: ExperimentDefinition<TSchema, TRawKey, TVariant>
  ): ExperimentDefinition<TSchema, TRawKey, TVariant> =>
    definition;
