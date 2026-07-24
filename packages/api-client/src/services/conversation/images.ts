import { z } from "@cs/validation";

import type { EndpointConfig } from "../../endpoints/types";

const ImageSchema = z.object({ refId: z.string(), url: z.string() });
const ImagesV1Schema = z.object({
  data: z.array(ImageSchema),
  nextId: z.string(),
});
const ImagesV2Schema = z.object({
  data: z.array(ImageSchema),
  prevCursor: z.string(),
});

export const getImagesConfig: EndpointConfig<
  { id: string; limit: number; nextId?: number | string },
  z.infer<typeof ImagesV1Schema>
> = {
  auth: "required",
  method: "GET",
  path: (input) => `/users/conversations/${input.id}/images`,
  responseSchema: ImagesV1Schema,
  toQuery: (input) => ({
    limit: input.limit,
    nextId: input.nextId,
  }),
  version: "v1",
};

export const getImagesV2Config: EndpointConfig<
  { id: string; limit: number; prevCursor?: number | string },
  z.infer<typeof ImagesV2Schema>
> = {
  auth: "required",
  method: "GET",
  path: (input) => `/users/conversations/${input.id}/images`,
  responseSchema: ImagesV2Schema,
  toQuery: (input) => ({
    limit: input.limit,
    prevCursor: input.prevCursor,
  }),
  version: "v2",
};
