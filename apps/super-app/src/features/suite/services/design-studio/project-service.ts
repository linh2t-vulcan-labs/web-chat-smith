import { SUITE_CREATIVE_STUDIO_ENDPOINTS } from "@/features/suite/api/endpoints";
import { suiteHttpClient } from "@/features/suite/services/base";
import {
  SuiteCreativeCreateProjectPayloadDTO,
  SuiteCreativeListProjectsQueryDTO,
  SuiteCreativeProjectModel,
  SuiteCreativeRenameProjectPayloadDTO,
} from "@/features/suite/types/design-studio";
import type {
  TSuiteCreativeCreateProjectResponseDTO,
  TSuiteCreativeDeleteProjectResponseDTO,
  TSuiteCreativeGetProjectResponseDTO,
  TSuiteCreativeListProjectsResponseDTO,
  TSuiteCreativeProjectDTO,
  TSuiteCreativeProjectServiceAPIs,
  TSuiteCreativeRenameProjectResponseDTO,
} from "@/features/suite/types/design-studio";
import type { SuiteHttp } from "@/features/suite/types/http";
import { TransformerBuilder } from "@/libs/class-transformer";

function transformProject(
  project: TSuiteCreativeProjectDTO
): SuiteCreativeProjectModel {
  return new TransformerBuilder(SuiteCreativeProjectModel)
    .format(project, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    })
    .toPlainCamelCase() as SuiteCreativeProjectModel;
}

function transformProjects(
  projects: TSuiteCreativeProjectDTO[]
): SuiteCreativeProjectModel[] {
  return new TransformerBuilder(SuiteCreativeProjectModel)
    .format(projects, {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    })
    .toPlainCamelCase() as SuiteCreativeProjectModel[];
}

export const suiteCreativeProjectServiceAPIs = (
  client: SuiteHttp
): TSuiteCreativeProjectServiceAPIs => ({
  createProject: async (input) => {
    const payload = new TransformerBuilder(SuiteCreativeCreateProjectPayloadDTO)
      .format(input, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as unknown as Record<string, unknown>;

    const [error, result] =
      await client.post<TSuiteCreativeCreateProjectResponseDTO>(
        SUITE_CREATIVE_STUDIO_ENDPOINTS.projects,
        {
          body: payload,
        }
      );

    if (error) {
      return [error, null];
    }

    if (!result) {
      return [null, null];
    }

    return [null, transformProject(result.project)];
  },

  deleteProject: (input) =>
    client.delete<TSuiteCreativeDeleteProjectResponseDTO>(
      SUITE_CREATIVE_STUDIO_ENDPOINTS.project(input.projectId)
    ),

  getProject: async (input) => {
    const [error, result] =
      await client.get<TSuiteCreativeGetProjectResponseDTO>(
        SUITE_CREATIVE_STUDIO_ENDPOINTS.project(input.projectId)
      );

    if (error) {
      return [error, null];
    }

    if (!result) {
      return [null, null];
    }

    return [null, transformProject(result.project)];
  },

  listProjects: async (input = {}) => {
    const query = new TransformerBuilder(SuiteCreativeListProjectsQueryDTO)
      .format(input, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as unknown as Record<string, unknown>;

    const [error, result] =
      await client.get<TSuiteCreativeListProjectsResponseDTO>(
        SUITE_CREATIVE_STUDIO_ENDPOINTS.projects,
        {
          params: query,
        }
      );

    if (error) {
      return [error, null];
    }

    if (!result) {
      return [null, null];
    }

    return [
      null,
      {
        nextPageToken: result.next_page_token,
        projects: transformProjects(result.projects),
      },
    ];
  },

  renameProject: async (input) => {
    const payload = new TransformerBuilder(SuiteCreativeRenameProjectPayloadDTO)
      .format(input, {
        excludeExtraneousValues: true,
        exposeUnsetFields: false,
      })
      .toPlainSnakeCase() as unknown as Record<string, unknown>;

    const [error, result] =
      await client.patch<TSuiteCreativeRenameProjectResponseDTO>(
        SUITE_CREATIVE_STUDIO_ENDPOINTS.projectTitle(input.projectId),
        {
          body: payload,
        }
      );

    if (error) {
      return [error, null];
    }

    if (!result) {
      return [null, null];
    }

    return [null, transformProject(result)];
  },
});

export const suiteCreativeProjectClientService =
  suiteCreativeProjectServiceAPIs(suiteHttpClient);
