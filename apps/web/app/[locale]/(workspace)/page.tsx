import { WorkspaceSessionStatus } from "@/components/workspace/session-status";

export const metadata = {
  description:
    "Placeholder proving the guest-session bootstrap + auth handoff flow end-to-end.",
  title: "Chat",
};

/**
 * Placeholder page — proves the guest-session infra (bootstrap → create →
 * refresh, guest→auth handoff) works on a real route, not a full feature
 * build. This is the app's root ("/") — see docs/runbook/api-client.md §4.5.
 */
const ChatPage = () => (
  <div className="flex min-h-svh flex-col gap-4 p-6">
    <h1 className="font-semibold text-lg">Chat</h1>
    <WorkspaceSessionStatus />
  </div>
);

export default ChatPage;
