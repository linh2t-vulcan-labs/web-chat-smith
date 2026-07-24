import "server-only";
import { createSuiteServerHttp } from "@/features/suite/services/base.server";
import { suiteCreativeProjectServiceAPIs } from "@/features/suite/services/design-studio/project-service";
import type { TSuiteCreativeListProjectsQueryInput } from "@/features/suite/types/design-studio";
import { THttpError } from "@/utils/commons/error";

import { suiteCreativeQueryKeys } from "./query-keys";

type GetProjectsServerQueryInput = TSuiteCreativeListProjectsQueryInput & {
  nextPageSize?: number;
};

export const getProjectsServerQueryOptions = (
  input: GetProjectsServerQueryInput,
  accessToken: string
) => {
  const { nextPageSize, ...listInput } = input;
  const service = suiteCreativeProjectServiceAPIs(
    createSuiteServerHttp(accessToken)
  );

  return {
    getNextPageParam: (
      lastPage: Awaited<ReturnType<typeof service.listProjects>>[1]
    ) => lastPage?.nextPageToken || undefined,
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }: { pageParam: unknown }) => {
      const pageToken = typeof pageParam === "string" ? pageParam : null;
      const [error, result] = await service.listProjects({
        ...listInput,
        pageSize: pageToken
          ? (nextPageSize ?? listInput.pageSize)
          : listInput.pageSize,
        pageToken,
      });

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    queryKey: suiteCreativeQueryKeys.projects({ ...input, isEnabled: true }),
    staleTime: 60_000,
  };
};
