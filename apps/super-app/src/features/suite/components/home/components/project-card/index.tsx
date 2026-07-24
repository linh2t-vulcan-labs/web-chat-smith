"use client";

import type { ComponentProps, MouseEvent } from "react";

import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";
import { Link } from "@/i18n/navigation";

import { LogoImage } from "../logo-image";

export type ProjectCardProject = Readonly<{
  id: string;
  title: string;
  date: string;
  thumbnail?: string;
}>;

type ProjectCardProps<TProject extends ProjectCardProject> = Readonly<{
  project: TProject;
  href?: ComponentProps<typeof Link>["href"];
  onClick?: (id: TProject["id"]) => void;
}>;

export function ProjectCard<TProject extends ProjectCardProject>({
  project,
  href = "#",
  onClick,
}: ProjectCardProps<TProject>) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (href === "#") {
      event.preventDefault();
    }

    if (!onClick) {
      return;
    }

    // Modifier / middle clicks keep the native Link (open-in-new-tab via href) — don't hijack them.
    const isModifiedClick =
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0;
    if (isModifiedClick && href !== "#") {
      return;
    }

    // Plain left-click is handled in-app: onClick opens the detail optimistically and updates the
    // URL via replaceState. Prevent the Link's own navigation so the detail view isn't mounted a
    // second time by the route change — that double-mount re-ran the sidebar and, from view-all,
    // dropped the back-target context (route [id] page has no onBack → fell back to home).
    event.preventDefault();
    onClick(project.id);
  };

  return (
    <Link
      href={href}
      data-testid={DATA_TEST_ID.suite.home.projectCard}
      onClick={handleClick}
      className="rounded-v1-large p-v1-structural-content-micro hover:bg-v1-surface-overlay-interactive-hover flex min-w-0 flex-1 flex-col overflow-hidden transition-colors"
    >
      <LogoImage
        src={project.thumbnail}
        alt={project.title}
        width={278}
        className="rounded-v1-medium aspect-278/156 shrink-0 self-stretch"
      />

      <div className="gap-v1-structural-content-micro px-v1-structural-component-medium py-v1-structural-component-small flex flex-col self-stretch">
        <p className="typo-v1-title-md-normal text-v1-text-hierarchy-primary self-stretch truncate text-start font-medium">
          {project.title}
        </p>
        <p className="typo-v1-support-secondary-normal text-v1-text-hierarchy-tertiary self-stretch text-start font-normal">
          {project.date}
        </p>
      </div>
    </Link>
  );
}
