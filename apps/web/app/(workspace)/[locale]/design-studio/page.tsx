import { WorkspaceSessionStatus } from "@/components/workspace/session-status";

export const metadata = {
  description:
    "Placeholder proving the guest-session bootstrap + auth handoff flow end-to-end.",
  title: "Design Studio",
};

/**
 * Placeholder page — proves the guest-session infra (bootstrap → create →
 * refresh, guest→auth handoff) works on a real route, not a full feature
 * build. Distinct from `(marketing)/design-studio-templates`, which is an
 * intentionally public (`auth: "none"`) demo page unrelated to guest
 * sessions. See docs/runbook/api-client.md §4.5.
 */
const DesignStudioPage = () => (
  <div className="flex min-h-svh flex-col gap-4 p-6">
    <h1 className="font-semibold text-lg">Design Studio</h1>
    <WorkspaceSessionStatus />
  </div>
);

export default DesignStudioPage;
