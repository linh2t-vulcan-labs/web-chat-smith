"use client";

import type { ComponentProps } from "react";

import ChevronRightIcon from "@/features/suite/assets/icons/chevron-right-icon.svg";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";
import { Link } from "@/i18n/navigation";

import { CreateProjectCard } from "../components/create-project-card";
import { ProjectCard } from "../components/project-card";

export type RecentProject = Readonly<{
  id: string;
  title: string;
  date: string;
  thumbnail?: string;
}>;

export type HomeRecentProjectsSectionProps = Readonly<{
  projects?: readonly RecentProject[];
  showViewAll?: boolean;
  viewAllHref: ComponentProps<typeof Link>["href"];
  getProjectHref?: (id: string) => ComponentProps<typeof Link>["href"];
  onCreateNew?: () => void;
  onProjectClick?: (id: string) => void;
}>;

const EMPTY_PROJECTS: readonly RecentProject[] = [];

export function HomeRecentProjectsSection({
  projects = EMPTY_PROJECTS,
  showViewAll = true,
  viewAllHref,
  getProjectHref,
  onCreateNew,
  onProjectClick,
}: HomeRecentProjectsSectionProps) {
  return (
    <div
      data-testid={DATA_TEST_ID.suite.home.homeRecentProjectsSection}
      className="gap-v1-structural-section-compact flex w-full max-w-292 flex-col items-center"
    >
      <div className="flex flex-row items-center justify-between self-stretch">
        <h2 className="text-heading-scale-0 text-v1-text-hierarchy-emphasis min-w-0 flex-1 font-medium capitalize">
          Recent Projects
        </h2>

        {showViewAll && (
          <Link
            href={viewAllHref}
            className="rounded-v1-pill px-v1-structural-component-small py-v1-structural-content-micro flex flex-row items-center overflow-hidden"
          >
            <span className="px-v1-structural-content-micro text-functional-scale-2 text-v1-action-text-tertiary font-normal capitalize">
              View all
            </span>
            <ChevronRightIcon
              className="text-v1-action-icon-tertiary size-5"
              aria-hidden
            />
          </Link>
        )}
      </div>

      <div className="gap-v1-structural-component-micro grid grid-cols-1 self-stretch md:grid-cols-2 lg:grid-cols-4">
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
