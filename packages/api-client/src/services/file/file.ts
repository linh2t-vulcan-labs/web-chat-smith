import { z } from "@cs/validation";

import { defineService } from "../../endpoints/registry";

const UploadPolicySchema = z.object({
  fileId: z.string(),
  uploadPolicy: z.record(z.string(), z.string()),
  uploadUrl: z.string(),
});

const DownloadLinkSchema = z.object({
  downloadUrl: z.string(),
  fileId: z.string(),
});

export type UploadPolicy = z.infer<typeof UploadPolicySchema>;

/** Service segment `smith-engine` per docs/runbook/api-client.md §16 (Upload / File). */
export const fileService = defineService("smith-engine")
  .endpoint("getUploadPolicy", {
    auth: "required",
    method: "POST",
    path: "/users/web/files",
    responseSchema: UploadPolicySchema,
    retry: false,
    version: "v1",
  })
  .endpoint("getDownloadLink", {
    auth: "required",
    method: "GET",
    path: (input: { fileId: string }) =>
      `/users/web/files/${input.fileId}/download`,
    responseSchema: DownloadLinkSchema,
    version: "v1",
  })
  .endpoint("createFileFromUrls", {
    auth: "required",
    method: "POST",
    path: "/users/web/files/from-urls",
    retry: false,
    version: "v1",
  });
