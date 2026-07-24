import { ApiError } from "../errors/api-error";
import type { ApiResult } from "../errors/api-error";

/** Minimal structural shape a Zod (Mini) schema satisfies — keeps callers decoupled from a specific zod import. */
export interface ResponseSchema<T> {
  parse: (value: unknown) => T;
}

/**
 * Validate `data` against an endpoint's `responseSchema`, normalizing a
 * schema-validation failure into the same `ApiError` shape every other
 * failure in this package produces. Shared by endpoints/registry.ts (client)
 * and server/server-fetch.ts (Server Components/Actions) so this
 * contract-drift-detection logic can't drift between the two — no
 * `responseSchema` means the raw parsed body passes through unvalidated.
 */
export const parseWithSchema = <T>(
  schema: ResponseSchema<T> | undefined,
  data: unknown
): ApiResult<T> => {
  if (!schema) {
    return [null, data as T];
  }
  try {
    return [null, schema.parse(data)];
  } catch (parseError) {
    return [ApiError.parseFailure(parseError), null];
  }
};
