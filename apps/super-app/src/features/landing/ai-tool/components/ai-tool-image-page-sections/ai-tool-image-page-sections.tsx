import type { AiToolGroupSegment } from "../../constants/groups";
import type { AiToolPageDocument } from "../../sanity/get-ai-tool-page";
import type {
  AIToolSectionPageContext,
  AiToolSectionResolved,
  MoreResourceAiTool,
} from "../../types/types";
import AIToolFeatureSection from "../ai-tool-feature-section/ai-tool-feature-section";
import AIToolHeroSection from "../ai-tool-hero-section/ai-tool-hero-section";
import AIToolMetricSection from "../ai-tool-metric-section/ai-tool-metric-section";
import AIToolStepSection from "../ai-tool-step-section/ai-tool-step-section";
import MoreResourceAITool from "../more-resource-ai-tool/more-resource-ai-tool";

export type AIToolPageSection = AiToolSectionResolved;

export interface AIToolImagePageSectionsProps {
  sections: AiToolPageDocument["sections"];
  group: AiToolGroupSegment;
  slug: string;
  language: string;
  linkAiTool?: MoreResourceAiTool | null;
  redirectLink?: string;
}

function renderSection(
  section: AIToolPageSection,
  page: AIToolSectionPageContext
) {
  switch (section.sectionType) {
    case "metric": {
      return <AIToolMetricSection key={section._key} data={section} />;
    }
    case "hero": {
      return (
        <AIToolHeroSection key={section._key} data={section} page={page} />
      );
    }
    case "feature": {
      return <AIToolFeatureSection key={section._key} data={section} />;
    }
    case "step": {
      return (
        <AIToolStepSection key={section._key} data={section} page={page} />
      );
    }
    default: {
      return null;
    }
  }
}

export default async function AIToolImagePageSections({
  sections,
  group,
  slug,
  language,
  linkAiTool,
  redirectLink,
}: AIToolImagePageSectionsProps) {
  const page: AIToolSectionPageContext = { group, redirectLink, slug };

  const nodes = sections?.length
    ? await Promise.all(
        sections.filter(Boolean).map((section) => renderSection(section, page))
      )
    : [];

  return (
    <>
      {nodes}
      <MoreResourceAITool
        language={language}
        page={page}
        linkAiTool={linkAiTool}
      />
    </>
  );
}
