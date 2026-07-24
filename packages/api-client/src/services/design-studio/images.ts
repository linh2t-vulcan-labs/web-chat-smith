import { z } from "@cs/validation";

import type { EndpointConfig } from "../../endpoints/types";
import { toPageQuery } from "./constants";
import type { PageInput } from "./constants";

const ImageSchema = z.object({
  createdAt: z.string(),
  downloadUrl: z.string(),
  format: z.string(),
  height: z.number(),
  id: z.string(),
  messageId: z.string(),
  projectId: z.string(),
  storagePath: z.optional(z.string()),
  width: z.number(),
});

const ImageGroupSchema = z.object({
  images: z.array(ImageSchema),
  messageId: z.string(),
  template: z.nullable(ImageSchema),
});

export const listImagesConfig: EndpointConfig<
  { projectId: string } & PageInput,
  {
    groups: z.infer<typeof ImageGroupSchema>[];
    images: z.infer<typeof ImageSchema>[];
    nextPageToken: string | null;
  }
> = {
  auth: "required",
  method: "GET",
  path: (input) => `/projects/${input.projectId}/images`,
  responseSchema: z.object({
    groups: z.array(ImageGroupSchema),
    images: z.array(ImageSchema),
    nextPageToken: z.nullable(z.string()),
  }),
  toQuery: (input) => toPageQuery(input),
};

export const exportImageConfig: EndpointConfig<
  { projectId: string; imageId: string; format: "PNG" | "JPEG" | "WEBP" },
  { downloadUrl: string }
> = {
  auth: "required",
  method: "POST",
  path: (input) =>
    `/projects/${input.projectId}/images/${input.imageId}/export`,
  responseSchema: z.object({ downloadUrl: z.string() }),
  retry: false,
  toBody: (input) => ({ format: input.format }),
};
