import { getExtracted } from "next-intl/server";
import dynamic from "next/dynamic";
import { Suspense } from "react";

import {
  ProjectWelcome,
  ProjectWelcomeSkeleton,
} from "@/components/project-welcome";

// Demo-only component, not needed for initial paint — deferred out of the
// main bundle.
const ExtractionDemo = dynamic(async () => {
  const mod = await import("@/components/extraction-demo");
  return mod.ExtractionDemo;
});

interface Props {
  params: Promise<{ locale: string }>;
}

// Cache Components implicitly validates every Page segment for instant
// navigation by default. This page reads `params` directly (for locale/i18n)
// both here and in `generateMetadata`, which is exactly the kind of
// URL-dependent read that can't be pushed behind <Suspense> without
// replacing the whole page with a fallback — not worth it for content that
// resolves synchronously from the URL. An ancestor's `instant = false`
// (see app/layout.tsx) only covers the static-shell check and exempting a
// *deeper* instant=true page; this page's own implicit validation needs its
// own opt-out.
// export const instant = false;
// export const prefetch = "allow-runtime";

export const generateMetadata = async ({ params }: Props) => {
  "use cache";
  const { locale } = await params;
  // ✅ Server-side extraction: `getExtracted` is cached per request, so
  // calling it again in the page body below costs no extra work.
  const t = await getExtracted({ locale });

  return {
    description: t(
      "Starter scaffold and i18n-extraction demo — moved out of the app's root."
    ),
    title: t("Playground"),
  };
};

/**
 * Former root ("/") content — the create-next-app-style welcome screen plus
 * the `useExtracted` demo — moved here once "/" became the chat page (see
 * `(workspace)/page.tsx`). `LanguageSwitcher`/`ThemeToggle`/`AuthStatus`,
 * previously assembled ad hoc in this page's body, are dropped here: they
 * now live once in the shared `<Header>` (`apps/web/components/layout/header.tsx`),
 * mounted in `[locale]/layout.tsx` for every page.
 */
const PlaygroundPage = ({ params }: Props) => (
  <div className="flex min-h-svh flex-col gap-6 p-6">
    <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
      <Suspense fallback={<ProjectWelcomeSkeleton />}>
        <ProjectWelcome params={params} />
      </Suspense>

      <ExtractionDemo />
    </div>
  </div>
);

export default PlaygroundPage;
