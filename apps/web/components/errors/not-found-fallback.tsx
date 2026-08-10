import { Link } from "@cs/i18n/navigation";
import { getExtracted } from "next-intl/server";

/**
 * Shared body for every `[locale]/(marketing|workspace)/not-found.tsx` — used
 * when a page calls `notFound()` *after* the root layout has already
 * rendered (`<body>`/`NextIntlClientProvider` both exist), unlike
 * `app/global-not-found.tsx` which has to handle the invalid-locale case
 * where they don't. Safe to localize here since the request locale is
 * already resolved by `@cs/i18n/request`.
 */
export const NotFoundFallback = async () => {
  const t = await getExtracted();

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-lg font-medium">
        {t({ id: "Common.notFound.title", message: "Not found" })}
      </h1>
      <p className="text-muted-foreground">
        {t({
          id: "Common.notFound.description",
          message: "The page you're looking for doesn't exist or was removed.",
        })}
      </p>
      <Link className="underline" href="/">
        {t({ id: "Common.notFound.homeLink", message: "Return home" })}
      </Link>
    </div>
  );
};
