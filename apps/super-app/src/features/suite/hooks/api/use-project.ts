import { toastSomethingWentWrong } from "@/features/suite/components/custom/error-toast";
import { suiteCreativeProjectClientService } from "@/features/suite/services/design-studio/project-service";
import type {
  TSuiteCreativeCreateProjectInput,
  // TSuiteCreativeDeleteProjectInput,
  TSuiteCreativeListProjectsQueryInput,
  TSuiteCreativeRenameProjectInput,
} from "@/features/suite/types/design-studio";
import { getSuiteHttpStatusFromError } from "@/features/suite/utils/api-error";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { suiteCreativeQueryKeys } from "./query-keys";

// Create-project failures on these statuses surface a generic error toast (per spec).
const CREATE_PROJECT_TOAST_HTTP_STATUSES = new Set([401, 500]);

type UseGetProjectsInput = TSuiteCreativeListProjectsQueryInput & {
  nextPageSize?: number;
  isEnabled?: boolean;
};

export const useGetProjects = (input: UseGetProjectsInput = {}) =>
  useInfiniteQuery(getProjectsInfiniteQueryOptions(input));

export const getProjectsInfiniteQueryOptions = (
  input: UseGetProjectsInput = {}
) => {
  const { nextPageSize, isEnabled, ...listInput } = input;

  return {
    enabled: !!isEnabled,
    getNextPageParam: (
      lastPage: Awaited<
        ReturnType<typeof suiteCreativeProjectClientService.listProjects>
      >[1]
    ) => lastPage?.nextPageToken || undefined,
    initialPageParam: null as string | null,
    networkMode: "always" as const,
    queryFn: async ({ pageParam }: { pageParam: unknown }) => {
      const pageToken = typeof pageParam === "string" ? pageParam : null;
      const [error, result] =
        await suiteCreativeProjectClientService.listProjects({
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
    queryKey: suiteCreativeQueryKeys.projects(input),
    staleTime: 60_000,
  };
};

export const useGetProject = (projectId?: string) =>
  useQuery({
    enabled: !!projectId,
    networkMode: "always",
    queryFn: async () => {
      if (!projectId) {
        return null;
      }

      const [error, result] =
        await suiteCreativeProjectClientService.getProject({ projectId });

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    queryKey: suiteCreativeQueryKeys.project(projectId ?? ""),
  });

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TSuiteCreativeCreateProjectInput) => {
      const [error, result] =
        await suiteCreativeProjectClientService.createProject(input);

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    networkMode: "always",
    onError: (error) => {
      // Status is mapped from the backend body code (real HTTP status is stripped). Toast only for
      // 401/500; doesn't swallow — mutateAsync still rejects so callers keep their control flow.
      const status = getSuiteHttpStatusFromError(error);
      if (
        status !== null &&
        status !== undefined &&
        CREATE_PROJECT_TOAST_HTTP_STATUSES.has(status)
      ) {
        toastSomethingWentWrong();
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: suiteCreativeQueryKeys.projects(),
      });
    },
  });
};

export const useRenameProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TSuiteCreativeRenameProjectInput) => {
      const [error, result] =
        await suiteCreativeProjectClientService.renameProject(input);

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    networkMode: "always",
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey as unknown[];
          return (
            key[0] === "suite" &&
            key[1] === "creative" &&
            key[2] === "projects" &&
            key.length <= 4
          );
        },
      });
    },
  });
};

// const useDeleteProject = () => {
//   const queryClient = useQueryClient();

//   return useMutation({
//     networkMode: "always",
//     mutationFn: async (input: TSuiteCreativeDeleteProjectInput) => {
//       const [error, result] =
//         await suiteCreativeProjectClientService.deleteProject(input);

//       if (error) {
//         throw new THttpError(error);
//       }

//       return result;
//     },
//     onSuccess: async (_data, variables) => {
//       await queryClient.invalidateQueries({
//         queryKey: suiteCreativeQueryKeys.projects(),
//       });
//       queryClient.removeQueries({
//         queryKey: suiteCreativeQueryKeys.project(variables.projectId),
//       });
//     },
//   });
// };
