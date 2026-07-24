"use client";

import { useCallback } from "react";

import { suiteCreativeQueryKeys } from "@/features/suite/hooks/api/query-keys";
import { useSuiteConversation } from "@/features/suite/stores/conversation/hooks";
import type { SuitePromptingRoutes } from "@/features/suite/types/main-flow";
import { useQueryClient } from "@/libs/react-query";

interface UseSuiteProjectSelectionOptions {
  onProjectSelected: (projectId: string) => void;
  routes: SuitePromptingRoutes;
}

export const useSuiteProjectSelection = ({
  onProjectSelected,
  routes,
}: UseSuiteProjectSelectionOptions) => {
  const reset = useSuiteConversation((s) => s.reset);
  const queryClient = useQueryClient();

  const selectProject = useCallback(
    (projectId: string) => {
      reset();
      void queryClient.resetQueries({
        queryKey: suiteCreativeQueryKeys.messageHistory(projectId),
      });
      window.history.replaceState(null, "", routes.DETAIL(projectId));
      onProjectSelected(projectId);
    },
    [onProjectSelected, queryClient, routes, reset]
  );

  return {
    selectProject,
  };
};
