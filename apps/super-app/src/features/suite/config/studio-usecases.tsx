import type { CSSProperties, ReactNode } from "react";

import CreateLogoIcon from "@/features/suite/assets/icons/create-logo-icon.svg";
import type { SuiteTool } from "@/features/suite/types/routes";
import { DESIGN_STUDIO_USECASE_SLUG } from "@/features/suite/utils/constants/route";

export interface StudioUsecase {
  // URL segment under the studio root: /design-studio/<slug> deep-links to this use-case's home.
  slug: string;
  // Identity of the prompt chip this use-case selects on the home prompt input.
  chipId: string;
  label: string;
  icon: ReactNode;
  iconColorClass?: string;
  iconStyle?: CSSProperties;
}

// Each studio (tool) owns its list of use-cases. Single source that drives: deep-link routing,
// home chip rendering, and chip auto-select. Add a use-case = one entry; add a studio = one key.
export const STUDIO_USECASES = {
  design: [
    {
      chipId: "create-logo",
      icon: <CreateLogoIcon className="size-6" />,
      label: "Create Logo",
      slug: DESIGN_STUDIO_USECASE_SLUG.LOGO,
    },
  ],
  video: [],
} satisfies Record<Exclude<SuiteTool, "">, StudioUsecase[]>;

export const getStudioUsecases = (tool: SuiteTool): StudioUsecase[] =>
  tool in STUDIO_USECASES
    ? STUDIO_USECASES[tool as Exclude<SuiteTool, "">]
    : [];

export const getStudioUsecaseSlugs = (tool: SuiteTool): string[] =>
  getStudioUsecases(tool).map((usecase) => usecase.slug);

export const findStudioUsecaseBySlug = (
  tool: SuiteTool,
  slug: string
): StudioUsecase | undefined =>
  getStudioUsecases(tool).find((usecase) => usecase.slug === slug);
