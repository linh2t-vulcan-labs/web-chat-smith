"use client";

import { useMemo } from "react";

import { SuiteLoadingIcon } from "@/features/suite/components/custom/suite-loading-icon";
import { HomeAllProjectsPage } from "@/features/suite/components/home";
import { useGetProjects } from "@/features/suite/hooks/api/use-project";
import { useStudioViewAllBack } from "@/features/suite/hooks/use-studio-view-all-back";
import { useSuiteMainFlow } from "@/features/suite/hooks/use-suite-main-flow";
import {
  SUITE_TOOL,
  SUITE_TOOL_ROUTES,
} from "@/features/suite/utils/constants/route";
import { useInfiniteScrollObserver } from "@/hooks/use-infinite-scroll-observer";

import SuiteDetailMain from "./suite-detail-main";

// This page is the design tool's "view all projects" surface; derive every route/tool value from one
// constant so a tool change is a single edit, not a string hunt.
const TOOL = SUITE_TOOL.DESIGN;
const routes = SUITE_TOOL_ROUTES[TOOL];

export default function SuiteViewAllProjectMain() {
  const viewAllBack = useStudioViewAllBack(routes);
  const projectsQuery = useGetProjects({
    isEnabled: true,
    nextPageSize: 20,
    pageSize: 19,
  });
  const projects = useMemo(
    () =>
      projectsQuery.data?.pages.flatMap(
        (page) =>
          page?.projects.map((project) => ({
            date: new Date(project.updatedAt).toLocaleDateString("en-US", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            id: project.id,
            thumbnail: project.coverImageUrl,
            title: project.title,
          })) ?? []
      ) ?? [],
    [projectsQuery.data]
  );
  const {
    activeDetailEntryType,
    activeProjectId,
    activeTemplateAttachment,
    ensureActiveProjectId,
    handleBackToHome,
    handleCreateNew,
    handleProjectClick,
    isDetailActive,
    isProjectActivating,
  } = useSuiteMainFlow({
    routes,
    tool: TOOL,
    // Back from a project opened here returns to the view-all list, not home.
    baseRoute: routes.VIEW_ALL,
  });

  const handleBack = viewAllBack.onBack;

  const loadMoreRef = useInfiniteScrollObserver({
    enabled: !isDetailActive,
    fn: () => {
      void projectsQuery.fetchNextPage();
    },
    hasNextPage: projectsQuery.hasNextPage,
    loading: projectsQuery.isFetchingNextPage,
    rootMargin: "320px",
  });

  if (isDetailActive) {
    return (
      <SuiteDetailMain
        entryType={activeDetailEntryType}
        projectId={activeProjectId}
        templateAttachment={activeTemplateAttachment}
        tool={TOOL}
        onBack={handleBackToHome}
        onEnsureProjectId={ensureActiveProjectId}
        isProjectActivating={isProjectActivating}
      />
    );
  }

  return (
    <div className="bg-v1-surface-hierarchy-base py-v1-structural-layout-standard flex min-h-screen flex-col items-center px-4 sm:px-6 lg:px-8">
      <HomeAllProjectsPage
        projects={projects}
        backHref={viewAllBack.backHref}
        onBack={handleBack}
        getProjectHref={(id) => routes.DETAIL(id)}
        onCreateNew={handleCreateNew}
        onProjectClick={handleProjectClick}
      />
      <div ref={loadMoreRef} className="h-px w-full" />
      {projectsQuery.isFetchingNextPage && (
        <div className="flex w-full justify-center py-4">
          <SuiteLoadingIcon />
        </div>
      )}
    </div>
  );
}
