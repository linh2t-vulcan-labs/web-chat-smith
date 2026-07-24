import type { Metadata } from "next";

import { DesignStudioHomeRoute } from "@/components/suite-main/design-studio-home-route";
import SuiteDetailMain from "@/components/suite-main/suite-detail-main";
import { findStudioUsecaseBySlug } from "@/features/suite/config/studio-usecases";
import { SUITE_DETAIL_ENTRY_TYPE } from "@/features/suite/utils/constants/main-flow";
import { SUITE_TOOL } from "@/features/suite/utils/constants/route";
import { getDesignStudioUsecaseMetadata } from "@/features/suite/utils/design-studio-seo";

interface TPageParams {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export const generateMetadata = async ({
  params,
}: TPageParams): Promise<Metadata> => {
  const { locale, id } = await params;
  return getDesignStudioUsecaseMetadata(locale, id, false);
};

export default async function DesignStudioIdRoute({ params }: TPageParams) {
  const { id } = await params;
  // `id` is overloaded: a use-case slug (logo/post/…) deep-links to the studio home with that chip
  // selected; anything else is treated as a project id and opens the project detail.
  const usecase = findStudioUsecaseBySlug(SUITE_TOOL.DESIGN, id);
  if (usecase) {
    return <DesignStudioHomeRoute initialUsecaseSlug={usecase.slug} />;
  }

  return (
    <SuiteDetailMain
      entryType={SUITE_DETAIL_ENTRY_TYPE.PROJECT}
      projectId={id}
      tool={SUITE_TOOL.DESIGN}
    />
  );
}
