import type { FlagSchema } from "./schema";

export interface FlagAuditFinding {
  key: string;
  type: "release" | "experiment";
  owner: string;
  expiresAt: string;
  ticketUrl?: string;
  status: "expired" | "ok";
}

/**
 * Flags every `release`/`experiment` entry whose `expiresAt` has passed —
 * `config` entries are skipped, they have no end date by design (see
 * {@link FlagGovernance} in `./schema`).
 *
 * Pure and provider-agnostic: takes the schema and a reference instant, does
 * no I/O. `apps/web` wires this into a CLI script that fails CI when an
 * expired `release` flag is still referenced — see
 * `docs/runbook/flags-and-release-workflow.md`.
 */
export const auditFlagSchema = (
  schema: FlagSchema,
  now: Date
): FlagAuditFinding[] => {
  const findings: FlagAuditFinding[] = [];
  for (const [key, entry] of Object.entries(schema)) {
    const { governance } = entry;
    if (governance.type === "config") {
      continue;
    }
    const isExpired = new Date(governance.expiresAt).getTime() <= now.getTime();
    findings.push({
      expiresAt: governance.expiresAt,
      key,
      owner: governance.owner,
      status: isExpired ? "expired" : "ok",
      ticketUrl: governance.ticketUrl,
      type: governance.type,
    });
  }
  return findings;
};
