import type { ReactNode } from "react";

import { GuestSessionProvider } from "@/components/providers/guest-session-provider";

/**
 * Shared shell for routes that work for BOTH guests and authenticated users
 * at the same URL (`/chat`, `/design-studio`) — no separate `/guest/*` route
 * tree the way apps/super-app has one. Guest-vs-authenticated is a session
 * concern handled here and in `GuestSessionProvider`, not a routing concern:
 * `apps/web/proxy.ts` deliberately does no redirect gating for these routes.
 */
const WorkspaceLayout = ({ children }: { children: ReactNode }) => (
  <GuestSessionProvider>{children}</GuestSessionProvider>
);

export default WorkspaceLayout;
