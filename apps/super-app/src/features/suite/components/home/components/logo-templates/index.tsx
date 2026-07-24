"use client";

import WandSparklesIcon from "@/features/suite/assets/icons/use-template-icon.svg";
import { DATA_TEST_ID } from "@/features/suite/utils/constants/data-test-id";
import { Link } from "@/i18n/navigation";

import { LogoImage } from "../logo-image";

export interface LogoTemplate {
  id: string;
  title: string;
  thumbnail?: string;
}

export interface HomeLogoTemplatesSectionProps {
  templates?: LogoTemplate[];
  onUseTemplate?: (template: LogoTemplate) => void;
}

const EMPTY_TEMPLATES: LogoTemplate[] = [];

function UpcomingBadge() {
  return (
    <span
      data-testid={DATA_TEST_ID.suite.home.upcomingBadge}
      className="rounded-v1-standard px-v1-structural-content-micro py-v1-optical-subtle typo-v1-label-micro-allcap bg-v1-google-lavender-background text-v1-google-lavender-text border-v1-google-lavender-border opacity-v1-de-emphasis inline-flex h-5 items-center justify-center border"
    >
      Upcoming
    </span>
  );
}

function TemplateCard({
  template,
  onUse,
}: {
  template: LogoTemplate;
  onUse?: (template: LogoTemplate) => void;
}) {
  return (
    <Link
      href="#"
      data-testid={DATA_TEST_ID.suite.home.templateCard}
      onClick={(event) => {
        event.preventDefault();
        onUse?.(template);
      }}
      className="rounded-v1-medium group relative w-full cursor-pointer overflow-hidden"
    >
      <LogoImage
        src={template.thumbnail}
        alt={template.title}
        width={221}
        height={221}
        className="rounded-v1-medium aspect-square object-cover"
      />

      <div className="rounded-v1-medium pb-v1-optical-normal ps-v1-optical-normal pe-v1-optical-normal absolute inset-s-0 inset-e-0 bottom-0 flex flex-col opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <span className="rounded-v1-pill bg-v1-action-background-secondary px-v1-structural-component-medium py-v1-optical-normal flex min-w-0 flex-1 items-center justify-center overflow-hidden">
          <WandSparklesIcon
            className="text-v1-action-icon-secondary size-5"
            aria-hidden
          />
          <span className="px-v1-structural-content-micro text-functional-scale-1 leading-functional-scale-2 text-v1-action-text-secondary font-normal capitalize">
            Use Template
          </span>
        </span>
      </div>
    </Link>
  );
}

export function HomeLogoTemplatesSection({
  templates = EMPTY_TEMPLATES,
  onUseTemplate,
}: HomeLogoTemplatesSectionProps) {
  return (
    <div
      data-testid={DATA_TEST_ID.suite.home.homeLogoTemplatesSection}
      className="gap-v1-structural-section-compact mb-v1-structural-layout-standard flex w-full max-w-292 flex-col items-center"
    >
      <div className="flex self-stretch overflow-hidden">
        <div className="border-v1-border-interactive-active py-v1-structural-content-tight flex items-center border-b-2">
          <span className="text-heading-scale-0 text-v1-action-text-secondary font-medium capitalize">
            Logo
          </span>
        </div>

        <div className="gap-v1-optical-normal ps-v1-structural-section-standard py-v1-structural-content-tight flex items-center">
          <span className="typo-v1-heading-h5 text-v1-action-text-tertiary opacity-v1-disabled-states-disabled">
            Poster
          </span>
          <UpcomingBadge />
        </div>
      </div>

      <div className="gap-v1-structural-content-relaxed grid grid-cols-1 self-stretch md:grid-cols-3 lg:grid-cols-5">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onUse={onUseTemplate}
          />
        ))}
      </div>
    </div>
  );
}
