import { usageClientService } from "@/core/repositories";
import { useQuery } from "@/libs/react-query";
import { defaultChatFreeUsage } from "@/utils/constants/user";

interface TGetFreeUsageOptions {
  enabled?: boolean;
}

const getFreeUsageQueryKey = (options: TGetFreeUsageOptions) => [
  "useGetFreeUsage",
  options.enabled,
];

const useGetFreeUsage = (options: TGetFreeUsageOptions) =>
  useQuery({
    enabled: !!options.enabled,
    queryFn: async () => await usageClientService.getFreeUsageCount(),
    queryKey: getFreeUsageQueryKey(options),
    select: (resp) => {
      const [error, result] = resp;

      if (error) {
        return defaultChatFreeUsage;
      }

      return result;
    },
  });

export { useGetFreeUsage };
