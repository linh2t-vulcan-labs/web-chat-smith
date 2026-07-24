import { useMutation, useQueryClient } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

import { useHttpClient } from "../http-client";

export const useDeleteAccountMutation = () => {
  const { httpClient } = useHttpClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const [error, result] = await httpClient.delete(
        "/user-management/api/v2/users"
      );
      if (error) {
        throw new THttpError(error);
      }
      return result;
    },
    mutationKey: ["delete-account"],
    onMutate: async () => {
      await queryClient.cancelQueries();
    },
  });
};
