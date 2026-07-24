import { PricingContent } from "@/features/landing/pricing/components";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function PricingPage({ params }: PageProps) {
  const { locale } = await params;
  return <PricingContent locale={locale} />;
}
