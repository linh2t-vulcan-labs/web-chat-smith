"use client";

import { useEffect, useRef } from "react";

import { toastConnectionLost } from "@/features/suite/components/custom/error-toast";
import { useSuiteConversation } from "@/features/suite/stores/conversation/hooks";
import type { ConversationItem } from "@/features/suite/types/conversation";
import type {
  PendingLoginFlow,
  PendingLoginSuiteAction,
  SuiteDetailEntryType,
  SuitePromptingRoutes,
  SuitePromptingTool,
  SuiteTemplatePromptAttachment,
} from "@/features/suite/types/main-flow";
import {
  PENDING_LOGIN_PROMPTING_ACTION_KEY,
  SUITE_DETAIL_ENTRY_TYPE,
  SUITE_PENDING_LOGIN_FLOW,
  SUITE_PROMPTING_ACTION_TYPE,
} from "@/features/suite/utils/constants/main-flow";
import { SUITE_TOOL_ROUTES } from "@/features/suite/utils/constants/route";
import { useAuthState } from "@/store/auth/hooks";

interface UseSuitePendingLoginFlowOptions {
  activateDetailOptimistically: (
    items: ConversationItem[],
    entryType: SuiteDetailEntryType,
    templateAttachment?: SuiteTemplatePromptAttachment
  ) => number;
  createProjectForFlow: (flowId: number) => Promise<string>;
  isGuest: boolean;
  resetProjectActivation: () => void;
  routes: SuitePromptingRoutes;
  tool: SuitePromptingTool;
}

const isSuitePromptingTool = (
  value: string | undefined
): value is SuitePromptingTool =>
  value !== undefined && value in SUITE_TOOL_ROUTES;

const isPendingLoginFlow = (
  value: string | undefined
): value is PendingLoginFlow =>
  value === SUITE_PENDING_LOGIN_FLOW.PROMPTING ||
  value === SUITE_PENDING_LOGIN_FLOW.TEMPLATE;

const getEntryTypeFromPendingLoginFlow = (
  flow: PendingLoginFlow
): SuiteDetailEntryType => {
  if (flow === SUITE_PENDING_LOGIN_FLOW.TEMPLATE) {
    return SUITE_DETAIL_ENTRY_TYPE.TEMPLATE;
  }

  return SUITE_DETAIL_ENTRY_TYPE.PROMPTING;
};

const getPendingLoginAction = (): PendingLoginSuiteAction | null => {
  const rawAction = localStorage.getItem(PENDING_LOGIN_PROMPTING_ACTION_KEY);

  if (!rawAction) {
    return null;
  }

  try {
    const action = JSON.parse(rawAction) as Partial<PendingLoginSuiteAction>;
    const flow = action.flow ?? SUITE_PENDING_LOGIN_FLOW.PROMPTING;

    if (
      !isPendingLoginFlow(flow) ||
      action.type !== SUITE_PROMPTING_ACTION_TYPE ||
      !isSuitePromptingTool(action.tool) ||
      !Array.isArray(action.payload?.items)
    ) {
      return null;
    }

    if (action.targetPath !== SUITE_TOOL_ROUTES[action.tool].HOME) {
      return null;
    }

    return {
      ...action,
      flow,
    } as PendingLoginSuiteAction;
  } catch {
    return null;
  }
};

export const useSuitePendingLoginFlow = ({
  activateDetailOptimistically,
  createProjectForFlow,
  isGuest,
  resetProjectActivation,
  routes: _routes,
  tool,
}: UseSuitePendingLoginFlowOptions) => {
  const setItems = useSuiteConversation((s) => s.setItems);
  const setIsOpenLoginModal = useAuthState(
    (state) => state.setIsOpenLoginModal
  );
  const didResumePendingLoginRef = useRef(false);
  const postLoginHomeRoute = SUITE_TOOL_ROUTES[tool].HOME;

  useEffect(() => {
    if (didResumePendingLoginRef.current) {
      return;
    }

    if (isGuest) {
      return;
    }

    const action = getPendingLoginAction();

    if (action?.targetPath !== postLoginHomeRoute) {
      return;
    }

    didResumePendingLoginRef.current = true;

    const resumePendingLoginAction = async () => {
      if (!navigator.onLine) {
        localStorage.removeItem(PENDING_LOGIN_PROMPTING_ACTION_KEY);
        toastConnectionLost();
        return;
      }

      const flowId = activateDetailOptimistically(
        action.payload.items,
        getEntryTypeFromPendingLoginFlow(action.flow),
        action.payload.templateAttachment
      );
      localStorage.removeItem(PENDING_LOGIN_PROMPTING_ACTION_KEY);

      if (action.flow === SUITE_PENDING_LOGIN_FLOW.TEMPLATE) {
        return;
      }

      await createProjectForFlow(flowId);
    };

    void (async () => {
      try {
        await resumePendingLoginAction();
      } catch {
        didResumePendingLoginRef.current = false;
        resetProjectActivation();
        if (!navigator.onLine) {
          toastConnectionLost();
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGuest, postLoginHomeRoute]);

  const handlePendingLoginAction = (
    pendingItems: ConversationItem[],
    flow: PendingLoginFlow,
    templateAttachment?: SuiteTemplatePromptAttachment
  ) => {
    const action: PendingLoginSuiteAction =
      flow === SUITE_PENDING_LOGIN_FLOW.TEMPLATE
        ? {
            flow,
            payload: {
              items: pendingItems,
              ...(templateAttachment && { templateAttachment }),
            },
            targetPath: postLoginHomeRoute,
            tool,
            type: SUITE_PROMPTING_ACTION_TYPE,
          }
        : {
            flow,
            payload: {
              items: pendingItems,
            },
            targetPath: postLoginHomeRoute,
            tool,
            type: SUITE_PROMPTING_ACTION_TYPE,
          };

    localStorage.setItem(
      PENDING_LOGIN_PROMPTING_ACTION_KEY,
      JSON.stringify(action)
    );
    setItems(pendingItems);
    setIsOpenLoginModal(true);
  };

  const handlePendingLoginPrompting = (pendingItems: ConversationItem[]) => {
    handlePendingLoginAction(pendingItems, SUITE_PENDING_LOGIN_FLOW.PROMPTING);
  };

  const handlePendingLoginTemplate = (
    pendingItems: ConversationItem[],
    templateAttachment?: SuiteTemplatePromptAttachment
  ) => {
    handlePendingLoginAction(
      pendingItems,
      SUITE_PENDING_LOGIN_FLOW.TEMPLATE,
      templateAttachment
    );
  };

  return {
    handlePendingLoginPrompting,
    handlePendingLoginTemplate,
  };
};
