import { useCallback } from "react";

import type { GetFileModel } from "@/core/models/file";
import type { TResponse } from "@/core/models/http";
import { fileClientService } from "@/core/repositories";
import { useQuery } from "@/libs/react-query";

export const useGetFileUrl = (fileId?: string) =>
  useQuery({
    enabled: !!fileId,
    queryFn: async () => {
      if (!fileId) {
        return;
      }

      return await fileClientService.getFileUrl(fileId);
    },
    queryKey: ["useGetFileUrl", fileId],
    refetchOnWindowFocus: false,
    select: useCallback(
      (response: TResponse<GetFileModel> | undefined): GetFileModel => {
        if (!response) {
          return { fileId: "", fileUrl: "" };
        }
        const [_error, data] = response;

        if (!data) {
          return { fileId: "", fileUrl: "" };
        }

        return data;
      },
      []
    ),
  });
