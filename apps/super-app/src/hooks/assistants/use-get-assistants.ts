import { useTranslations } from "next-intl";

import type { TQueryAssistantInput } from "@/core/models/assistant";
import { assistantClientService } from "@/core/repositories";
import { useQuery } from "@/libs/react-query";

export const useGetAssistants = (input: TQueryAssistantInput) => {
  const t = useTranslations("mainLayout.sidebarV2");

  const mappingAssistantName = {
    academic_writing: t("writing"),
  };

  return useQuery({
    queryFn: async () => await assistantClientService.getAssistants(input),
    queryKey: ["useGetAssistants", input],
    select: (response) => {
      const [error, data] = response;

      if (error) {
        return [];
      }

      return data.map((item) => ({
        ...item,
        label:
          mappingAssistantName[item.id as keyof typeof mappingAssistantName],
      }));
    },
  });
};
