import { conversationClientService } from "@/core/repositories";
import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

export function usePostSelectedCustomResponse() {
  return useMutation({
    mutationFn: async (item: string) => {
      const [error, result] =
        await conversationClientService.postSelectedCustomResponse(item);

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
  });
}
