import { Button } from "@cs/ui/components/shadcn/button";
import { Skeleton } from "@cs/ui/components/shadcn/skeleton";
import { getExtracted } from "next-intl/server";

export const ProjectWelcome = async () => {
  // ✅ Asynchronous extraction in a Server Component. Locale comes from the
  // request config (`@cs/i18n/request`, backed by `next/root-params`), not
  // a `params` prop — `locale` is a root param now, so it isn't part of this
  // page's own `params`.
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
    <Skeleton className="h-8 w-48" />
    <Skeleton className="mt-4 h-4 w-full" />
    <Skeleton className="mt-2 h-4 w-full" />
    <Skeleton className="mt-2 h-4 w-3/4" />
    <Skeleton className="mt-2 h-10 w-20" />
  </>
);
