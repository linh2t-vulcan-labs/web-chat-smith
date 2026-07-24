import { notificationService } from "@/core/repositories";
import { useMutation } from "@/libs/react-query";
import { THttpError } from "@/utils/commons/error";

export function usePushTokens() {
  return useMutation({
    mutationFn: async (pushToken: string) => {
      const [error, result] =
        await notificationService.registerFCMToken(pushToken);

      if (error) {
        throw new THttpError(error);
      }

      return result;
    },
    onError: (error: unknown) => {
      console.error("Error registering FCM token:", error);
      return error;
    },
  });
}
