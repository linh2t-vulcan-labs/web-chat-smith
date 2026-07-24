import { z } from "@cs/validation";

import type { QueryParams } from "../../types";

/**
 * "Creative Studio" (design-studio) domain — confirmed against
 * apps/super-app/src/features/suite/. Its base path doesn't follow the
 * default "/{service}/api/{version}" convention (same escape hatch as the
 * `notification` service, see docs/runbook/api-client.md §8).
 */
export const DESIGN_STUDIO_PATH_PREFIX = "/creative-studio/v1/creative";
export const DESIGN_STUDIO_SERVICE = "creative-studio";

/**
 * The backend sends verbose `SOMETHING_STATUS_X` string enums; the legacy
 * client lower-cases them before exposing to app code — this is a value
 * remap (not something the generic camelCase/snake_case key conversion can
 * do), shared by every schema in this domain that needs it (uploads.ts,
 * messages.ts).
 */
export const remapValue = (map: Record<string, string>, value: string) =>
  map[value] ?? value;

export const EmptyResponseSchema = z.record(z.string(), z.never());

export interface PageInput {
  pageSize?: number;
  pageToken?: string | null;
}

/**
 * Every list endpoint in this domain takes the same 2 pagination fields —
 * one place to build the query subset instead of re-deriving `{pageSize,
 * pageToken}` at each list endpoint (some of which also mix in their own
 * extra field, e.g. `listImages`' `projectId`, `listTemplates`' `category` —
 * those still spread this in rather than repeating it).
 */
export const toPageQuery = (input: PageInput): QueryParams => ({
  pageSize: input.pageSize,
  pageToken: input.pageToken,
});
