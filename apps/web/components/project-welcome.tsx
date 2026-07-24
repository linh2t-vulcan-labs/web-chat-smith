import { Button } from "@cs/ui/components/button";
import { getExtracted, setRequestLocale } from "next-intl/server";

interface Props {
  params: Promise<{ locale: string }>;
}

export const ProjectWelcome = async ({ params }: Props) => {
  const { locale } = await params;
  setRequestLocale(locale);

  // ✅ Asynchronous extraction in a Server Component.
  const t = await getExtracted();
  return (
    <>
      <h1 className="font-medium">{t("Project ready!")}</h1>
      <p>{t("You may now add components and start building.")}</p>
      <p>{t("We've already added the button component for you.")}</p>
      <Button className="mt-2">{t("Button")}</Button>
    </>
  );
};

export const ProjectWelcomeSkeleton = () => (
  <>
    <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
    <div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-4" />
    <div className="h-4 w-full bg-gray-200 rounded animate-pulse mt-2" />
    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mt-2" />
    <div className="h-10 w-20 bg-gray-200 rounded animate-pulse mt-2" />
  </>
);
