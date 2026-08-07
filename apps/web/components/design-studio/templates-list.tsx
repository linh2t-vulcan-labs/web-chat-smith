"use client";

import { useApiQuery } from "@cs/api-client/hooks/use-api-query";
import { designStudio } from "@cs/api-client/services/design-studio";
import { InlineError } from "@cs/ui/components/cs/inline-error";
import { Skeleton } from "@cs/ui/components/shadcn/skeleton";
import { useExtracted } from "next-intl";

import { TEMPLATES_QUERY_KEY } from "@/components/design-studio/templates-query-key";
import { useApiErrorCopy } from "@/hooks/use-api-error-copy";
import type { ApiErrorCopy } from "@/hooks/use-api-error-copy";

/**
 * `<Suspense fallback>` for the Server Component boundary in
 * `app/[locale]/(marketing)/design-studio-templates/page.tsx` — sized to
 * roughly match
 * a few rows of the real list so the swap doesn't reflow (see
 * `skeleton_loading_convention` — one skeleton, sized for the real content).
 */
export const TemplatesListSkeleton = () => (
  <ul className="flex flex-col gap-2">
    {Array.from({ length: 3 }, (_, index) => (
      <li className="flex flex-col gap-1" key={index}>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-16" />
      </li>
    ))}
  </ul>
);

interface TemplateListItem {
  id: string;
  name: string;
  category: string;
}

const TemplatesListItems = ({
  templates,
}: {
  templates: TemplateListItem[];
}) => (
  <ul className="flex flex-col gap-2">
    {templates.map((template) => (
      <li className="flex flex-col" key={template.id}>
        <span>{template.name}</span>
        <span className="text-muted-foreground text-xs">
          {template.category}
        </span>
      </li>
    ))}
  </ul>
);

const TemplatesListError = ({
  copy,
  onRetry,
  retryLabel,
}: {
  copy: ApiErrorCopy;
  onRetry: () => void;
  retryLabel: string;
}) => (
  <InlineError
    description={copy.description}
    onRetry={copy.retryable ? onRetry : undefined}
    retryLabel={retryLabel}
    title={copy.title}
  />
);

/**
 * Demo of the server-prefetch pattern (`packages/api-client/README.md` §3):
 * `designStudio.listTemplates` is the one endpoint in this domain with
 * `auth: "none"` (public template catalog) AND the same for every visitor,
 * so the Server Component fetches it through Next's `"use cache"` (cross-
 * request) rather than `prefetchServerQuery()` (which can't cache across
 * requests — see that file's doc comment) before handing it off here via
 * `HydrationBoundary`. This component is the ONLY render of the fetched data
 * (the Server Component only prefetches, never renders the list itself) —
 * `queryKey` here must match the one used in that prefetch exactly, or
 * hydration lands on a different cache entry and this just refetches from
 * scratch client-side.
 */
export const TemplatesList = () => {
  const t = useExtracted();
  const { getErrorCopy } = useApiErrorCopy();
  const { data, error, isPending, refetch } = useApiQuery({
    queryFn: ({ signal }) => designStudio.listTemplates({}, { signal }),
    queryKey: TEMPLATES_QUERY_KEY,
  });

  if (isPending) {
    return <TemplatesListSkeleton />;
  }

  if (error) {
    return (
      <TemplatesListError
        copy={getErrorCopy(error)}
        onRetry={() => refetch()}
        retryLabel={t({ id: "Common.actions.retry", message: "Try again" })}
      />
    );
  }

  if (data.templates.length === 0) {
    return <p className="text-muted-foreground">No templates yet.</p>;
  }

  return <TemplatesListItems templates={data.templates} />;
};
