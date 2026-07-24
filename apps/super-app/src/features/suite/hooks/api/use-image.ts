import { suiteCreativeImageClientService } from "@/features/suite/services/design-studio/image-service";
import type { TSuiteCreativeListImagesQueryInput } from "@/features/suite/types/design-studio";
import { useInfiniteQuery } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { suiteCreativeQueryKeys } from "./query-keys";

export const useGetProjectImages = (
  input: TSuiteCreativeListImagesQueryInput
) =>
  useInfiniteQuery({
    enabled: !!input.projectId,
    getNextPageParam: (lastPage) => lastPage?.nextPageToken || undefined,
    initialPageParam: null as string | null,
    networkMode: "always",
    queryFn: async ({ pageParam }) => {
      const [error, result] = await suiteCreativeImageClientService.listImages({
        ...input,
        pageToken: pageParam,
      });

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    queryKey: suiteCreativeQueryKeys.projectImages(input.projectId),
  });

// const useExportImage = () =>
//   useMutation({
//     networkMode: "always",
//     mutationFn: async (input: TSuiteCreativeExportImageInput) => {
//       const [error, result] =
//         await suiteCreativeImageClientService.exportImage(input);

//       if (error) {
//         throw new THttpError(error);
//       }

//       return result;
//     },
//   });
