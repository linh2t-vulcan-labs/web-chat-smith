"use client";

import type { ComponentProps, MouseEvent } from "react";

import ChevronLeftIcon from "@/features/suite/assets/icons/chevron-left-icon.svg";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";
import { Link } from "@/i18n/navigation";

import { CreateProjectCard } from "../components/create-project-card";
import { ProjectCard } from "../components/project-card";

export interface AllProjectsProject {
  id: string;
  title: string;
  date: string;
  thumbnail?: string;
}

export interface HomeAllProjectsPageProps {
  projects?: AllProjectsProject[];
  backHref?: ComponentProps<typeof Link>["href"];
  getProjectHref?: (id: string) => ComponentProps<typeof Link>["href"];
  onBack?: () => void;
  onCreateNew?: () => void;
  onProjectClick?: (id: string) => void;
}

const EMPTY_PROJECTS: AllProjectsProject[] = [];

export function HomeAllProjectsPage({
  projects = EMPTY_PROJECTS,
  backHref = "#",
  getProjectHref,
  onBack,
  onCreateNew,
  onProjectClick,
}: HomeAllProjectsPageProps) {
  const handleBackClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (backHref === "#" || onBack) {
      event.preventDefault();
    }

    onBack?.();
  };

  return (
    <div
      data-testid={DATA_TEST_ID.suite.home.homeAllProjectsPage}
      className="gap-v1-structural-section-compact flex w-full max-w-292 flex-col items-center"
    >
      <div className="flex flex-row items-center justify-between self-stretch">
        <h1 className="text-heading-scale-0 text-v1-text-hierarchy-emphasis min-w-0 flex-1 font-medium capitalize">
          Recent Projects
        </h1>

        <Link
          href={backHref}
          onClick={handleBackClick}
          className="rounded-v1-pill px-v1-structural-component-small py-v1-structural-content-micro flex flex-row items-center overflow-hidden"
        >
          <ChevronLeftIcon
            className="text-v1-action-icon-tertiary size-5"
            aria-hidden
          />
          <span className="px-v1-structural-content-micro text-functional-scale-2 text-v1-action-text-tertiary font-normal capitalize">
            Back
          </span>
        </Link>
      </div>

      <div className="gap-y-v1-structural-component-small gap-x-v1-structural-content-tight grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <CreateProjectCard onClick={onCreateNew} />
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            href={getProjectHref?.(project.id)}
            onClick={onProjectClick}
          />
        ))}
      </div>
    </div>
  );
}
