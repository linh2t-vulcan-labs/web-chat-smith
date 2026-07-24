import type { TUploadFileLinkResponse } from "@/core/models/file";
import type { TResponse } from "@/core/models/http";
import { fileClientService } from "@/core/repositories";
import { useMutation } from "@/libs/react-query";

export const useMutationCreateFile = (
  handleSuccess?: (data: TResponse<TUploadFileLinkResponse>) => void,
  handleError?: (error: Error) => void
) =>
  useMutation({
    mutationFn: async ({ file }: { file: File }) =>
      await fileClientService.uploadFile(file),
    mutationKey: ["useMutationCreateFile"],
    onError: (error) => {
      handleError?.(error);
    },
    onSuccess: (data) => {
      handleSuccess?.(data);
    },
  });
