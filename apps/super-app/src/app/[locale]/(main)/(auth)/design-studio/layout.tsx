import "@/features/suite/styles/suite-global.css";
import type { Metadata } from "next";

import { SuiteFeatureGuard } from "@/features/suite/components/custom/suite-feature-guard";
import { SuiteConversationProvider } from "@/features/suite/stores/conversation/context";
import { getDesignStudioBaseMetadata } from "@/features/suite/utils/design-studio-seo";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return getDesignStudioBaseMetadata(locale, false);
};

export default function SuiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="suite-root">
      <SuiteConversationProvider>
        <SuiteFeatureGuard isAuthenticated>{children}</SuiteFeatureGuard>
      </SuiteConversationProvider>
    </div>
  );
}
