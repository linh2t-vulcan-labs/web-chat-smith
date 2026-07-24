import { fileClientService } from "@/core/repositories";
import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

export const useCreateFilesByUrl = () =>
  useMutation({
    mutationFn: async ({ fileUrl }: { fileUrl: string[] }) => {
      const [error, result] = await fileClientService.createFilesByUrl(fileUrl);

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
  });
