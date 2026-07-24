import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DesignStudioHomeRoute } from "@/components/suite-main/design-studio-home-route";
import { findStudioUsecaseBySlug } from "@/features/suite/config/studio-usecases";
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
  return getDesignStudioUsecaseMetadata(locale, id, true);
};

export default async function GuestDesignStudioIdRoute({
  params,
}: TPageParams) {
  // Guests only deep-link to use-case homes (/guest/design-studio/<slug>); they have no projects, so
  // any non-use-case id is invalid here → 404.
  const { id } = await params;
  const usecase = findStudioUsecaseBySlug(SUITE_TOOL.DESIGN, id);
  if (!usecase) {
    notFound();
  }

  return <DesignStudioHomeRoute isGuest initialUsecaseSlug={usecase.slug} />;
}
