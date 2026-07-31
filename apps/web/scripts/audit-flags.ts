import { auditFlagSchema } from "@cs/flags";

import { flagSchema } from "@/lib/flags";

/**
 * CI gate: fails when a `release`/`experiment` flag is past its
 * `expiresAt` and still declared in the schema — see
 * docs/runbook/flags-and-release-workflow.md §4/§10 for the lifecycle this
 * enforces. Run with `bun scripts/audit-flags.ts`.
 */
const findings = auditFlagSchema(flagSchema, new Date());
const expired = findings.filter((finding) => finding.status === "expired");

if (findings.length === 0) {
  console.log("No release/experiment flags to audit (config-only schema).");
}

for (const finding of findings) {
  const marker = finding.status === "expired" ? "EXPIRED" : "ok";
  console.log(
    `[${marker}] ${finding.key} (${finding.type}, owner: ${finding.owner}, expiresAt: ${finding.expiresAt})${
      finding.ticketUrl ? ` — ${finding.ticketUrl}` : ""
    }`
  );
}

if (expired.length > 0) {
  console.error(
    `\n${expired.length} flag(s) past their expiresAt — remove the flag and its code path, or extend expiresAt with a reason.`
  );
  process.exit(1);
}
