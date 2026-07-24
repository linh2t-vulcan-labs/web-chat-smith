"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { toastEditTitleFailed } from "@/features/suite/components/custom/error-toast";
import {
  useGetProject,
  useRenameProject,
} from "@/features/suite/hooks/api/use-project";
import type { SuiteDetailEntryType } from "@/features/suite/types/main-flow";
import { getSuiteHttpStatusFromError } from "@/features/suite/utils/api-error";
import { SUITE_DETAIL_ENTRY_TYPE } from "@/features/suite/utils/constants/main-flow";

const FALLBACK_PROJECT_TITLE = "Untitled Project";

// Rename failures on these statuses surface a generic error toast (per analytics/UX spec).
const RENAME_TOAST_HTTP_STATUSES = new Set([400, 401, 404, 500]);

interface UseSuiteProjectTitleOptions {
  entryType: SuiteDetailEntryType;
  projectId?: string;
}

const getDisplayTitle = (title: string | undefined) => {
  const trimmedTitle = title?.trim();
  return trimmedTitle || FALLBACK_PROJECT_TITLE;
};

export const useSuiteProjectTitle = ({
  entryType,
  projectId,
}: UseSuiteProjectTitleOptions) => {
  const shouldUseProjectDetail =
    entryType === SUITE_DETAIL_ENTRY_TYPE.PROJECT && Boolean(projectId);
  const projectQuery = useGetProject(
    shouldUseProjectDetail ? projectId : undefined
  );
  const renameProjectMutation = useRenameProject();
  const serverTitle = shouldUseProjectDetail
    ? projectQuery.data?.title
    : undefined;
  const title = getDisplayTitle(serverTitle);
  const [draftTitle, setDraftTitle] = useState(title);

  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- resyncs local draft title when the server-derived title changes; derived-from-query-data resync, not a render derivation
    setDraftTitle(title);
  }, [title]);

  const resetDraftTitle = useCallback(() => {
    setDraftTitle(title);
  }, [title]);

  const commitDraftTitle = useCallback(async () => {
    const nextTitle = draftTitle.trim();
    if (!nextTitle) {
      resetDraftTitle();
      return;
    }

    // Rename whenever we have a real projectId — NOT gated on entryType. During the
    // create/template stream flow entryType stays PROMPTING/TEMPLATE even though a
    // real project already exists (finishProjectActivation set projectId), so gating
    // on entryType === PROJECT would silently skip the rename API mid-stream.
    if (!projectId || nextTitle === title) {
      setDraftTitle(nextTitle);
      return;
    }

    try {
      await renameProjectMutation.mutateAsync({
        projectId,
        title: nextTitle,
      });
    } catch (error) {
      // Status is mapped from the backend body code (real HTTP status is stripped). Show the generic
      // error toast only for 400/401/404/500; other failures are left silent per spec.
      const status = getSuiteHttpStatusFromError(error);
      if (
        status !== null &&
        status !== undefined &&
        RENAME_TOAST_HTTP_STATUSES.has(status)
      ) {
        toastEditTitleFailed();
      }
    }
  }, [draftTitle, projectId, renameProjectMutation, resetDraftTitle, title]);

  return useMemo(
    () => ({
      canRename: Boolean(projectId),
      commitDraftTitle,
      draftTitle,
      isRenamingTitle: renameProjectMutation.isPending,
      resetDraftTitle,
      setDraftTitle,
      title,
    }),
    [
      projectId,
      commitDraftTitle,
      draftTitle,
      renameProjectMutation.isPending,
      resetDraftTitle,
      title,
    ]
  );
};
