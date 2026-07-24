import { suiteCreativeTemplateClientService } from "@/features/suite/services/design-studio/template-service";
import type { TSuiteCreativeListTemplatesQueryInput } from "@/features/suite/types/design-studio";
import { useInfiniteQuery } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { suiteCreativeQueryKeys } from "./query-keys";

export const useGetTemplates = (
  input: TSuiteCreativeListTemplatesQueryInput = {}
) => useInfiniteQuery(getTemplatesInfiniteQueryOptions(input));

export const getTemplatesInfiniteQueryOptions = (
  input: TSuiteCreativeListTemplatesQueryInput = {}
) => ({
  getNextPageParam: (
    lastPage: Awaited<
      ReturnType<typeof suiteCreativeTemplateClientService.listTemplates>
    >[1]
  ) => lastPage?.nextPageToken || undefined,
  initialPageParam: null as string | null,
  networkMode: "always" as const,
  queryFn: async ({ pageParam }: { pageParam: unknown }) => {
    const [error, result] =
      await suiteCreativeTemplateClientService.listTemplates({
        ...input,
        pageToken: typeof pageParam === "string" ? pageParam : null,
      });

    if (error) {
      throw new THttpError(error);
    }

    return result;
  },
  queryKey: suiteCreativeQueryKeys.templates(input),
  staleTime: Infinity,
});
