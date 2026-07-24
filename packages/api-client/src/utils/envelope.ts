import { z } from "@cs/validation";

/**
 * Some backend responses wrap the real payload in a single-key envelope
 * (e.g. `{ project: {...} }`, `{ data: {...} }`) — this unwraps it via a
 * real schema (not a type-only cast), so the wrapped shape is still
 * validated, not just asserted. One helper, reused by every domain that
 * has this shape (see conversation.ts, design-studio.ts) instead of each
 * file re-deriving its own pipe/transform.
 */
export const unwrapEnvelope = <TSchema extends z.core.$ZodType>(
  key: string,
  schema: TSchema
) =>
  z.pipe(
    z.object({ [key]: schema }),
    z.transform((raw) => raw[key] as z.infer<TSchema>)
  );
