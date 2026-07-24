"use client";

import { useEffect, useMemo, useState } from "react";

import {
  HomeLogoTemplatesSection,
  HomePromptingSection,
  HomeRecentProjectsSection,
} from "@/features/suite/components/home";
import {
  findStudioUsecaseBySlug,
  getStudioUsecases,
} from "@/features/suite/config/studio-usecases";
import { useGetProjects } from "@/features/suite/hooks/api/use-project";
import { useGetTemplates } from "@/features/suite/hooks/api/use-template";
import { useSuiteMainFlow } from "@/features/suite/hooks/use-suite-main-flow";
import { useSuiteTracking } from "@/features/suite/hooks/use-suite-tracking";
import type { SuiteMainProps } from "@/features/suite/types/main-flow";
import {
  GUEST_SUITE_TOOL_ROUTES,
  resolveStudioBackBase,
  SUITE_TOOL_ROUTES,
} from "@/features/suite/utils/constants/route";
import { orderBySeed } from "@/features/suite/utils/seeded-order";
import { resolveSessionSeed } from "@/features/suite/utils/session-seed";
import { usePathname } from "@/i18n/navigation";
import { useAuthState } from "@/store/auth/hooks";

import SuiteDetailMain from "./suite-detail-main";

const SuiteMain = ({
  isGuest = false,
  tool,
  initialUsecaseSlug,
  shuffleSeed,
}: SuiteMainProps) => {
  const routes = isGuest
    ? GUEST_SUITE_TOOL_ROUTES[tool]
    : SUITE_TOOL_ROUTES[tool];
  // Back target is frozen to the ENTRY use-case (server prop) so it can't drift while the Kind-2
  // detail fakes the URL to a project id.
  const originUsecase = initialUsecaseSlug
    ? findStudioUsecaseBySlug(tool, initialUsecaseSlug)
    : undefined;
  const baseRoute = resolveStudioBackBase(routes, originUsecase?.slug);
  // The selected chip follows the CURRENT url, not the entry: backing out to the bare studio root
  // (/design-studio) clears the chip, while being on a use-case home (/design-studio/<slug>) selects
  // it. The home subtree remounts on each detail<->home switch, so this re-reads the live path then.
  const pathname = usePathname();
  const currentUsecase = getStudioUsecases(tool).find(
    (usecase) => pathname === `${routes.HOME}/${usecase.slug}`
  );
  const tracking = useSuiteTracking();
  // Creative Studio Home visit — fire once on mount (tracking methods are stable refs).
  useEffect(() => {
    tracking.trackView();
  }, [tracking]);
  const projectsQuery = useGetProjects({ isEnabled: !isGuest, pageSize: 3 });
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
  const hasRecentProjects = projects.length > 0;
  const templatesQuery = useGetTemplates({ category: "logo", pageSize: 25 });
  // Freeze the seed once per mount: the server sends a fresh seed on every (soft-nav) render, but
  // resolveSessionSeed reuses the first seed of this browser session so soft-nav keeps the order; a real
  // reload starts a new JS context and reshuffles. Computed in the initializer so SSR/hydrate agree.
  const [effectiveSeed] = useState(() =>
    shuffleSeed === undefined ? undefined : resolveSessionSeed(shuffleSeed)
  );
  const templates = useMemo(() => {
    const mapped =
      templatesQuery.data?.pages.flatMap(
        (page) =>
          page?.templates.map((template) => ({
            id: template.id,
            imageUrl: template.imageUrl,
            thumbnail: template.thumbnailUrl,
            title: template.name,
          })) ?? []
      ) ?? [];
    return effectiveSeed === undefined
      ? mapped
      : orderBySeed(mapped, effectiveSeed);
  }, [templatesQuery.data, effectiveSeed]);
  const setIsOpenLoginModal = useAuthState((s) => s.setIsOpenLoginModal);
  const {
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
  } = useSuiteMainFlow({ baseRoute, isGuest, routes, tool });

  if (isDetailActive) {
    return (
      <SuiteDetailMain
        entryType={activeDetailEntryType}
        projectId={activeProjectId}
        templateAttachment={activeTemplateAttachment}
        tool={tool}
        onBack={handleBackToHome}
        onEnsureProjectId={ensureActiveProjectId}
        isProjectActivating={isProjectActivating}
      />
    );
  }

  return (
    <div className="bg-v1-surface-hierarchy-base flex min-h-screen flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <HomePromptingSection
        tool={tool}
        initialSelectedChipId={currentUsecase?.chipId}
        onSubmitAction={handleSubmitPrompt}
        onUploadClick={isGuest ? () => setIsOpenLoginModal(true) : undefined}
      />
      <div className="gap-v1-structural-section-compact flex w-full flex-col items-center">
        {!isGuest && hasRecentProjects && (
          <HomeRecentProjectsSection
            projects={projects}
            showViewAll={Boolean(projectsQuery.hasNextPage)}
            viewAllHref={routes.VIEW_ALL}
            getProjectHref={(id) => routes.DETAIL(id)}
            onCreateNew={handleCreateNew}
            onProjectClick={handleProjectClick}
          />
        )}
        <HomeLogoTemplatesSection
          templates={templates}
          onUseTemplate={(template) => {
            tracking.trackTemplateClick();
            handleUseTemplate(template);
          }}
        />
      </div>
    </div>
  );
};

export default SuiteMain;
