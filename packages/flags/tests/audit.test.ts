import { describe, expect, it } from "vitest";

import { auditFlagSchema } from "../src/audit";
import { defineFlagSchema } from "../src/schema";

const schema = defineFlagSchema({
  activeExperiment: {
    decoder: "number",
    defaultValue: 1,
    governance: {
      expiresAt: "2999-01-01",
      owner: "growth",
      type: "experiment",
    },
  },
  configValue: {
    decoder: "string",
    defaultValue: "x",
    governance: { owner: "platform", type: "config" },
  },
  expiredRelease: {
    decoder: "boolean",
    defaultValue: true,
    governance: {
      expiresAt: "2020-01-01",
      owner: "chat",
      ticketUrl: "https://example.com/issues/1",
      type: "release",
    },
  },
});

describe("auditFlagSchema", () => {
  const now = new Date("2026-01-01");

  it("skips config entries — they have no expiry by design", () => {
    const findings = auditFlagSchema(schema, now);
    expect(findings.find((f) => f.key === "configValue")).toBeUndefined();
  });

  it("marks a release entry past its expiresAt as expired", () => {
    const findings = auditFlagSchema(schema, now);
    const expired = findings.find((f) => f.key === "expiredRelease");
    expect(expired).toMatchObject({
      owner: "chat",
      status: "expired",
      ticketUrl: "https://example.com/issues/1",
      type: "release",
    });
  });

  it("marks an experiment entry not yet past its expiresAt as ok", () => {
    const findings = auditFlagSchema(schema, now);
    const active = findings.find((f) => f.key === "activeExperiment");
    expect(active).toMatchObject({ status: "ok", type: "experiment" });
  });
});
