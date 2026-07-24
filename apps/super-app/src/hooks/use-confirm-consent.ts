import { UploadTermsConsentModel } from "@/core/models/user";
import { userClientService } from "@/core/repositories";
import { TransformerBuilder } from "@/libs/class-transformer";
import { useMutation, useQueryClient } from "@/libs/react-query";
import { useGlobalState } from "@/store/global/hooks";
import { getUserInfoQueryKey } from "@/store/global/initialization-hooks/use-init-user-profile";
import { THttpError } from "@/utils/commons/error";

interface TMarkTermsConsentOptions {
  onSuccess?: () => void;
}

export interface TConfirmConsentInput {
  type: string;
  action_context: string;
  version: string;
}

export function useConfirmConsent(options?: TMarkTermsConsentOptions) {
  const queryClient = useQueryClient();
  const setConfirmConsent = useGlobalState((state) => state.setConfirmConsent);

  return useMutation({
    mutationFn: async (input: TConfirmConsentInput) => {
      const [error] = await userClientService.confirmConsent(input);

      if (error) {
        throw new THttpError(error);
      }

      const consentPayload = {
        action_context: input.action_context,
        timestamp: new Date().toISOString(),
        version: input.version,
      };
      const uploadTermsConsent = new TransformerBuilder(UploadTermsConsentModel)
        .format(consentPayload)
        .toPlainCamelCase() as UploadTermsConsentModel;
      setConfirmConsent(uploadTermsConsent);
      return true;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: getUserInfoQueryKey(true),
      });
      options?.onSuccess?.();
    },
  });
}
