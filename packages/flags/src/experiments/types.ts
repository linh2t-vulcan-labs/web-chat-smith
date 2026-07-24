import type { FlagSchema } from "../schema";

/**
 * A typed A/B(/n) experiment layered on top of one raw Remote Config flag.
 *
 * The raw value (a number or string, e.g. a Remote Config "UI version"
 * integer) is decoded exactly once via {@link ExperimentDefinition.decode}.
 * That single function is the entire "which raw value means which variant"
 * mapping — the pattern this replaces (modulo arithmetic and `Set`
 * membership checks copy-pasted across components) required understanding
 * and re-deriving that mapping at every call site.
 */
export interface ExperimentDefinition<
  TSchema extends FlagSchema,
  TRawKey extends keyof TSchema & string,
  TVariant extends string,
> {
  /** The schema key holding the raw experiment value (decoder "number" or "string"). */
  key: TRawKey;
  variants: readonly TVariant[];
  defaultVariant: TVariant;
  decode: (raw: TSchema[TRawKey]["defaultValue"]) => TVariant;
}

export interface ExperimentResult<TVariant extends string> {
  variant: TVariant;
  isReady: boolean;
}
