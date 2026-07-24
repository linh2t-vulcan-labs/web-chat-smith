import { usageClientService } from "@/core/repositories";
import { useMutation } from "@/libs/react-query";

export const useUpdateFreeUsageMutation = () =>
  useMutation({
    mutationFn: async () => await usageClientService.updateFreeUsageCount(),
    mutationKey: ["useUpdateFreeUsageMutation"],
  });
