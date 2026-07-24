import { z } from "@cs/validation";

import type { EndpointConfig } from "../../endpoints/types";
import { unwrapEnvelope } from "../../utils/envelope";
import { EmptyResponseSchema, toPageQuery } from "./constants";
import type { PageInput } from "./constants";

const ProjectSchema = z.object({
  coverImageUrl: z.optional(z.string()),
  createdAt: z.string(),
  id: z.string(),
  title: z.string(),
  updatedAt: z.string(),
  userId: z.string(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const createProjectConfig: EndpointConfig<{ title: string }, Project> = {
  auth: "required",
  method: "POST",
  path: "/projects",
  responseSchema: unwrapEnvelope("project", ProjectSchema),
  retry: false,
  toBody: (input) => input,
};

export const listProjectsConfig: EndpointConfig<
  PageInput,
  { nextPageToken: string | null; projects: Project[] }
> = {
  auth: "required",
  method: "GET",
  path: "/projects",
  responseSchema: z.object({
    nextPageToken: z.nullable(z.string()),
    projects: z.array(ProjectSchema),
  }),
  toQuery: toPageQuery,
};

export const getProjectConfig: EndpointConfig<{ projectId: string }, Project> =
  {
    auth: "required",
    method: "GET",
    path: (input) => `/projects/${input.projectId}`,
    responseSchema: unwrapEnvelope("project", ProjectSchema),
  };

export const renameProjectConfig: EndpointConfig<
  { projectId: string; title: string },
  Project
> = {
  auth: "required",
  method: "PATCH",
  path: (input) => `/projects/${input.projectId}/title`,
  // Confirmed asymmetric vs create/get: this response is the raw project
  // object, NOT wrapped in `{project: ...}`.
  responseSchema: ProjectSchema,
  toBody: (input) => ({ title: input.title }),
};

export const deleteProjectConfig: EndpointConfig<
  { projectId: string },
  Record<string, never>
> = {
  auth: "required",
  method: "DELETE",
  path: (input) => `/projects/${input.projectId}`,
  responseSchema: EmptyResponseSchema,
  retry: false,
};
