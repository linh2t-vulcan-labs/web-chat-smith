import { ApiQueryProvider } from "@cs/api-client/providers/query-client-provider";
import { ThemeProvider } from "@cs/themes";
import { TooltipProvider } from "@cs/ui/components/shadcn/tooltip";
import type { ReactNode } from "react";

import { AuthSyncProvider } from "@/components/providers/auth-sync-provider";

/**
 * App-wide providers, mounted once by the single root layout
 * (`app/[locale]/layout.tsx`). `locale` is a Next.js root param
 * (https://nextjs.org/docs/app/api-reference/functions/next-root-params), so
 * the root layout must live at `app/[locale]/layout.tsx` itself — there's no
 * layer left above `[locale]` to hide these providers behind to dodge the
 * client-side remount a dynamic segment's own layout gets on every param
 * change (e.g. a locale switch). `ApiQueryProvider` is unaffected (its
 * `QueryClient` is a module-level singleton — remounting the provider
 * component doesn't touch the cache). `ThemeProvider` is explicitly built to
 * tolerate this (see its own `useLayoutEffect` comment). `AuthSyncProvider`
 * remounting no longer flashes a loading skeleton either — `ApiAuthProvider`
 * seeds `isInitializing` from the `TokenManager` singleton's
 * `hasRestored()` (see that provider's doc comment) — so keeping
 * `(workspace)`/`(marketing)` under ONE root layout (so navigating between
 * them stays a client-side transition instead of Next's "multiple root
 * layouts" full-page-load behavior,
 * https://nextjs.org/docs/app/api-reference/file-conventions/layout#root-layout)
 * costs nothing observable here anymore.
 */
export const RootProviders = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>
    <TooltipProvider>
      <ApiQueryProvider>
        <AuthSyncProvider>{children}</AuthSyncProvider>
      </ApiQueryProvider>
    </TooltipProvider>
  </ThemeProvider>
);
