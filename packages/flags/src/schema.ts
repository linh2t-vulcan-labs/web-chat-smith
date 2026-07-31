import type { FLAG_DECODERS } from "./core/parsers";

export type FlagDecoder = keyof typeof FLAG_DECODERS;

/**
 * Who owns a flag and how long it's allowed to live, enforced at the type
 * level instead of by convention. `"release"`/`"experiment"` are expected to
 * be deleted eventually, so they must declare `expiresAt` up front; `"config"`
 * (plain remote config, not a toggle) has no end date by design.
 *
 * - `release`: an engineering kill-switch/rollout gate. Delete the flag and
 *   the code path it guards once rolled out to 100% — see the runbook's flag
 *   lifecycle checklist (`docs/runbook/flags-and-release-workflow.md`).
 * - `experiment`: a PO-owned A/B(/n) test. `expiresAt` is the experiment's
 *   decision date, not a hard technical deadline — extend deliberately, don't
 *   let it drift silently.
 * - `config`: long-lived remote config (content, thresholds, lists) that
 *   isn't a toggle and isn't expected to be removed.
 */
export type FlagGovernance =
  | { type: "release"; owner: string; expiresAt: string; ticketUrl?: string }
  | { type: "experiment"; owner: string; expiresAt: string; ticketUrl?: string }
  | { type: "config"; owner: string };

export interface FlagSchemaEntry<TValue> {
  decoder: FlagDecoder;
  defaultValue: TValue;
  governance: FlagGovernance;
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
