"use client";

import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";

import { toastConnectionLost } from "@/features/suite/components/custom/error-toast";
import type { PromptInputMessage } from "@/features/suite/components/ui/ai-elements/prompt-input";
import { getStudioUsecaseSlugs } from "@/features/suite/config/studio-usecases";
import { useCreateProject } from "@/features/suite/hooks/api/use-project";
import { useGetQuota } from "@/features/suite/hooks/api/use-quota";
import { useSuiteDetailRouteSync } from "@/features/suite/hooks/use-suite-detail-route-sync";
import { useSuitePendingLoginFlow } from "@/features/suite/hooks/use-suite-pending-login-flow";
import { useSuiteProjectSelection } from "@/features/suite/hooks/use-suite-project-selection";
import { useSuiteConversation } from "@/features/suite/stores/conversation/hooks";
import type {
  ConversationItem,
  SuiteTemplateConversationInput,
} from "@/features/suite/types/conversation";
import type {
  SuiteDetailEntryType,
  SuiteTemplatePromptAttachment,
  UseSuiteMainFlowOptions,
} from "@/features/suite/types/main-flow";
import { SUITE_DETAIL_ENTRY_TYPE } from "@/features/suite/utils/constants/main-flow";
import { getPromptAttachmentSnapshots } from "@/features/suite/utils/prompt-attachment-snapshot";
import { getTemplateConversation } from "@/features/suite/utils/template-conversation";

const DEFAULT_PROJECT_TITLE = "Untitled Project";

const getPendingItems = (message: PromptInputMessage): ConversationItem[] => {
  const images = message.files
    .filter(
      (file) => file.type === "file" && file.mediaType?.startsWith("image/")
    )
    .map((file) => file.url)
    .filter((url): url is string => !!url);
  const referenceUploadIds = message.files
    .map((file) => file.uploadId)
    .filter(
      (uploadId): uploadId is string =>
        typeof uploadId === "string" && uploadId !== ""
    );
  const promptAttachments = getPromptAttachmentSnapshots(message.files);

  return [
    {
      ...(images.length > 0 && { images }),
      ...(promptAttachments.length > 0 && { promptAttachments }),
      ...(referenceUploadIds.length > 0 && { referenceUploadIds }),
      text: message.text,
      type: "user",
    },
  ];
};

const getTemplatePromptAttachment = (
  template: SuiteTemplateConversationInput
): SuiteTemplatePromptAttachment | undefined => {
  if (!template.thumbnail) {
    return undefined;
  }

  return {
    id: template.id,
    imageUrl: template.imageUrl,
    thumbnailUrl: template.thumbnail,
    title: template.title,
  };
};

export const useSuiteMainFlow = ({
  isGuest = false,
  routes,
  tool,
  baseRoute = routes.HOME,
}: UseSuiteMainFlowOptions) => {
  const setItems = useSuiteConversation((s) => s.setItems);
  const createProjectMutation = useCreateProject();
  // Skip quota for guests — they have no auth token, so the call 401s → refresh → logout (kicks to login).
  const { data: quota } = useGetQuota({ enabled: !isGuest });
  const pendingProjectFlowRef = useRef(0);
  const activeProjectIdRef = useRef<string | null>(null);
  const pendingProjectActivationRef = useRef<{
    flowId: number;
    promise: Promise<string>;
  } | null>(null);
  const [activeDetailEntryType, setActiveDetailEntryType] =
    useState<SuiteDetailEntryType>();
  const [activeProjectId, setActiveProjectId] = useState<string | undefined>();
  const [activeTemplateAttachment, setActiveTemplateAttachment] =
    useState<SuiteTemplatePromptAttachment>();
  const [isDetailActive, setIsDetailActive] = useState(false);
  const [isProjectActivating, setIsProjectActivating] = useState(false);

  // Reset the detail layout state WITHOUT navigating — used both by the back button (after it sets
  // the URL) and by the route sync (when an external nav already changed the URL). Bumps the flow id
  // and drops any in-flight activation so a pending project creation can't re-open detail afterwards.
  const resetDetailState = () => {
    pendingProjectFlowRef.current += 1;
    pendingProjectActivationRef.current = null;
    activeProjectIdRef.current = null;
    setActiveDetailEntryType(undefined);
    setActiveProjectId(undefined);
    setActiveTemplateAttachment(undefined);
    setIsDetailActive(false);
    setIsProjectActivating(false);
  };

  // Keep detail layout state in sync with the URL: when an external navigation (sidebar icon,
  // browser back) leaves a detail path, drop the detail layout so UI and URL don't diverge.
  const usecaseSlugs = useMemo(() => getStudioUsecaseSlugs(tool), [tool]);
  useSuiteDetailRouteSync({
    isDetailActive,
    onLeaveDetail: resetDetailState,
    routes,
    usecaseSlugs,
  });

  const handleBackToHome = () => {
    // Navigate the URL to this surface's base (home, or view-all when mounted there), then reset.
    // The sync above would also reset on the resulting URL change; doing it here too avoids a frame
    // of stale detail UI.
    window.history.pushState(null, "", baseRoute);
    resetDetailState();
  };

  const activateDetailOptimistically = (
    items: ConversationItem[],
    entryType: SuiteDetailEntryType,
    templateAttachment?: SuiteTemplatePromptAttachment
  ) => {
    const flowId = pendingProjectFlowRef.current + 1;
    pendingProjectFlowRef.current = flowId;
    setItems(items);
    activeProjectIdRef.current = null;
    setActiveDetailEntryType(entryType);
    setActiveProjectId(undefined);
    setActiveTemplateAttachment(templateAttachment);
    setIsDetailActive(true);

    return flowId;
  };

  const finishProjectActivation = (flowId: number, projectId: string) => {
    if (pendingProjectFlowRef.current !== flowId) {
      return;
    }

    window.history.replaceState(null, "", routes.DETAIL(projectId));
    activeProjectIdRef.current = projectId;
    setActiveProjectId(projectId);
  };

  const createProjectForFlow = (flowId: number) => {
    const pendingProjectActivation = pendingProjectActivationRef.current;

    if (pendingProjectActivation?.flowId === flowId) {
      return pendingProjectActivation.promise;
    }

    setIsProjectActivating(true);

    const promise = (async () => {
      try {
        const project = await createProjectMutation.mutateAsync({
          title: DEFAULT_PROJECT_TITLE,
        });

        if (!project?.id) {
          throw new Error(
            "Creative Studio project creation returned empty project id."
          );
        }

        const projectId = project.id;
        finishProjectActivation(flowId, projectId);
        return projectId;
      } finally {
        if (pendingProjectActivationRef.current?.flowId === flowId) {
          pendingProjectActivationRef.current = null;
          setIsProjectActivating(false);
        }
      }
    })();

    pendingProjectActivationRef.current = {
      flowId,
      promise,
    };

    return promise;
  };

  const ensureActiveProjectId = () => {
    if (activeProjectIdRef.current) {
      return Promise.resolve(activeProjectIdRef.current);
    }

    const pendingProjectActivation = pendingProjectActivationRef.current;
    if (pendingProjectActivation) {
      return pendingProjectActivation.promise;
    }

    return createProjectForFlow(pendingProjectFlowRef.current);
  };

  const resetProjectActivation = () => {
    activeProjectIdRef.current = null;
    setActiveDetailEntryType(undefined);
    setActiveProjectId(undefined);
    setActiveTemplateAttachment(undefined);
    setIsDetailActive(false);
    setIsProjectActivating(false);
  };

  const { handlePendingLoginPrompting, handlePendingLoginTemplate } =
    useSuitePendingLoginFlow({
      activateDetailOptimistically,
      createProjectForFlow,
      isGuest,
      resetProjectActivation,
      routes,
      tool,
    });

  const { selectProject } = useSuiteProjectSelection({
    onProjectSelected: (projectId) => {
      pendingProjectFlowRef.current += 1;
      pendingProjectActivationRef.current = null;
      activeProjectIdRef.current = projectId;
      setActiveDetailEntryType(SUITE_DETAIL_ENTRY_TYPE.PROJECT);
      setActiveProjectId(projectId);
      setActiveTemplateAttachment(undefined);
      setIsDetailActive(true);
      setIsProjectActivating(false);
    },
    routes,
  });

  const handleCreateNew = () => {
    activateDetailOptimistically([], SUITE_DETAIL_ENTRY_TYPE.NEW_PROJECT);
  };

  const handleSubmitPrompt = async (
    message: PromptInputMessage,
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const pendingItems = getPendingItems(message);
    if (isGuest) {
      handlePendingLoginPrompting(pendingItems);
      return;
    }

    if (!navigator.onLine) {
      toastConnectionLost();
      return;
    }

    const flowId = activateDetailOptimistically(
      pendingItems,
      SUITE_DETAIL_ENTRY_TYPE.PROMPTING
    );

    // Navigate to detail first, then guard project creation. When quota is exceeded the detail
    // view's auto-submit will rollback the message to the prompt input and show the quota card.
    if (quota !== null && quota !== undefined && quota.remaining <= 0) {
      return;
    }

    try {
      await createProjectForFlow(flowId);
    } catch (error) {
      if (pendingProjectFlowRef.current === flowId) {
        resetProjectActivation();
      }
      if (!navigator.onLine) {
        toastConnectionLost();
      }
      throw error;
    }
  };

  const handleUseTemplate = (template: SuiteTemplateConversationInput) => {
    const templateConversation = getTemplateConversation(template);
    const templateAttachment = getTemplatePromptAttachment(template);
    if (isGuest) {
      handlePendingLoginTemplate(templateConversation, templateAttachment);
      return;
    }

    activateDetailOptimistically(
      templateConversation,
      SUITE_DETAIL_ENTRY_TYPE.TEMPLATE,
      templateAttachment
    );
  };

  const handleProjectClick = (projectId: string) => {
    selectProject(projectId);
  };

  return {
    activeDetailEntryType,
    activeProjectId,
    activeTemplateAttachment,
    ensureActiveProjectId,
    handleBackToHome,
    handleCreateNew,
    handleProjectClick,
    handleSubmitPrompt,
    handleUseTemplate,
    isDetailActive,
    isProjectActivating,
  };
};
