"use client";

import { useCallback, useMemo, useRef } from "react";

import { errorToast } from "@/features/suite/components/custom/error-toast";
import { CustomSideBar } from "@/features/suite/components/custom/side-bar";
import { SuiteSidebarOffset } from "@/features/suite/components/custom/suite-sidebar-offset";
import { StudioPage } from "@/features/suite/components/studio";
import { PromptInputProvider } from "@/features/suite/components/ui/ai-elements/prompt-input";
import type { SuitePromptInitialAttachment } from "@/features/suite/components/ui/ai-elements/prompt-input";
import { SidebarProvider } from "@/features/suite/components/ui/sidebar";
import { useSuiteProjectNotFoundRedirect } from "@/features/suite/hooks/use-suite-project-not-found-redirect";
import type {
  SuiteDetailEntryType,
  SuitePromptingTool,
  SuiteTemplatePromptAttachment,
} from "@/features/suite/types/main-flow";
import { SUITE_DETAIL_ENTRY_TYPE } from "@/features/suite/utils/constants/main-flow";
import { SUITE_TOOL_ROUTES } from "@/features/suite/utils/constants/route";

interface SuiteDetailMainProps {
  entryType?: SuiteDetailEntryType;
  isProjectActivating?: boolean;
  onBack?: () => void;
  onEnsureProjectId?: () => Promise<string | undefined>;
  projectId?: string;
  templateAttachment?: SuiteTemplatePromptAttachment;
  tool: SuitePromptingTool;
}

const getTemplateAttachmentFilename = (
  attachment: SuiteTemplatePromptAttachment
) => {
  const sanitizedTitle = attachment.title
    .trim()
    .replaceAll(/[^\w.-]+/gu, "-")
    .replaceAll(/^-+|-+$/gu, "");
  return `${sanitizedTitle || `template-${attachment.id}`}.jpg`;
};

export default function SuiteDetailMain({
  entryType,
  isProjectActivating = false,
  onBack,
  onEnsureProjectId,
  projectId,
  templateAttachment,
  tool,
}: SuiteDetailMainProps) {
  const detailEntryType = entryType ?? SUITE_DETAIL_ENTRY_TYPE.PROJECT;
  // Resolve the tool's home once and thread it down (string), so children stay tool-agnostic.
  const homeRoute = SUITE_TOOL_ROUTES[tool].HOME;
  const redirectOnProjectNotFound = useSuiteProjectNotFoundRedirect(
    homeRoute,
    onBack
  );
  const projectIdRef = useRef(projectId);
  // oxlint-disable-next-line react/react-compiler -- ref is intentionally kept in sync with the latest projectId each render so the stable getUploadProjectId callback below always reads the current value
  projectIdRef.current = projectId;
  const getUploadProjectId = useCallback(() => projectIdRef.current, []);
  const initialAttachments = useMemo<
    SuitePromptInitialAttachment[] | undefined
  >(() => {
    if (
      detailEntryType !== SUITE_DETAIL_ENTRY_TYPE.TEMPLATE ||
      !templateAttachment
    ) {
      return;
    }

    return [
      {
        filename: getTemplateAttachmentFilename(templateAttachment),
        id: `template-${templateAttachment.id}`,
        mediaType: "image/jpeg",
        removable: false,
        source: "template",
        type: "file",
        uploadStatus: "completed",
        url: templateAttachment.imageUrl ?? templateAttachment.thumbnailUrl,
      },
    ];
  }, [detailEntryType, templateAttachment]);

  return (
    <div
      className="suite-fullscreen-detail"
      data-suite-detail-entry-type={detailEntryType}
    >
      <SuiteSidebarOffset>
        <PromptInputProvider
          getUploadProjectId={getUploadProjectId}
          initialAttachments={initialAttachments}
          maxFiles={3}
          onError={(err) => {
            if (err.code === "max_files") {
              errorToast(
                "Upload limit reached",
                "You can upload up to 3 images per message"
              );
            }
          }}
        >
          <SidebarProvider
            style={
              {
                "--sidebar-width": "416px",
              } as React.CSSProperties
            }
          >
            <CustomSideBar
              entryType={detailEntryType}
              homeRoute={homeRoute}
              isProjectActivating={isProjectActivating}
              projectId={projectId}
              templateId={templateAttachment?.id}
              onBack={onBack}
              onEnsureProjectId={onEnsureProjectId}
            />
            <main className="flex-1">
              <StudioPage
                projectId={projectId}
                isNewProject={
                  detailEntryType === SUITE_DETAIL_ENTRY_TYPE.NEW_PROJECT
                }
                onProjectNotFound={redirectOnProjectNotFound}
              />
            </main>
          </SidebarProvider>
        </PromptInputProvider>
      </SuiteSidebarOffset>
    </div>
  );
}
