import { notificationService } from "@/core/repositories";
import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

export function useDeletePushToken() {
  return useMutation({
    mutationFn: async (pushToken: string) => {
      const [error, result] =
        await notificationService.unregisterPushToken(pushToken);

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    onError: (error: Error) => {
      console.error("Error delete FCM token:", error);
      return error;
    },
  });
}
