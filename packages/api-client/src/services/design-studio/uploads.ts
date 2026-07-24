import { z } from "@cs/validation";

import type { EndpointConfig } from "../../endpoints/types";
import { unwrapEnvelope } from "../../utils/envelope";
import { remapValue, toPageQuery } from "./constants";
import type { PageInput } from "./constants";

const UPLOAD_STATUS_MAP: Record<string, string> = {
  UPLOAD_STATUS_COMPLETED: "completed",
  UPLOAD_STATUS_FAILED: "failed",
  UPLOAD_STATUS_PENDING: "pending",
};

const UploadSchema = z.pipe(
  z.object({
    contentType: z.string(),
    createdAt: z.string(),
    downloadUrl: z.optional(z.string()),
    expiresAt: z.optional(z.string()),
    filename: z.string(),
    id: z.string(),
    projectId: z.optional(z.string()),
    sizeBytes: z.number(),
    status: z.string(),
    // Untouched by the global camelCase transform — real keys use hyphens
    // (`x-goog-algorithm`, ...), which the `_[a-z0-9]` conversion regex
    // never matches, so this arrives as-is.
    uploadPolicy: z.optional(z.record(z.string(), z.string())),
    uploadUrl: z.optional(z.string()),
    userId: z.string(),
  }),
  z.transform((raw) => ({
    ...raw,
    status: remapValue(UPLOAD_STATUS_MAP, raw.status),
  }))
);

export type Upload = z.infer<typeof UploadSchema>;

export const createUploadConfig: EndpointConfig<
  {
    projectId?: string;
    filename: string;
    contentType: "image/png" | "image/jpeg";
    sizeBytes: number;
    displayOnly?: boolean;
  },
  Upload
> = {
  auth: "required",
  method: "POST",
  path: "/uploads",
  responseSchema: unwrapEnvelope("upload", UploadSchema),
  retry: false,
  toBody: (input) => input,
};

export const completeUploadConfig: EndpointConfig<
  { uploadId: string; downloadUrl: string },
  Upload
> = {
  auth: "required",
  method: "POST",
  path: (input) => `/uploads/${input.uploadId}/complete`,
  responseSchema: unwrapEnvelope("upload", UploadSchema),
  retry: false,
  toBody: (input) => ({ downloadUrl: input.downloadUrl }),
};

export const getUploadConfig: EndpointConfig<{ uploadId: string }, Upload> = {
  auth: "required",
  method: "GET",
  path: (input) => `/uploads/${input.uploadId}`,
  responseSchema: unwrapEnvelope("upload", UploadSchema),
};

export const listUploadsConfig: EndpointConfig<
  PageInput,
  { nextPageToken: string; uploads: Upload[] }
> = {
  auth: "required",
  method: "GET",
  path: "/uploads",
  responseSchema: z.object({
    // Non-nullable here, unlike every other list endpoint's nextPageToken.
    nextPageToken: z.string(),
    uploads: z.array(UploadSchema),
  }),
  toQuery: toPageQuery,
};
