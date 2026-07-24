import { describe, expect, it } from "vitest";

import { createFlagsEngine } from "../src/core/engine";
import { defineExperiment } from "../src/experiments/define-experiment";
import { resolveExperiment } from "../src/experiments/resolve-experiment";
import { defineFlagSchema } from "../src/schema";
import { createTestAdapter } from "./test-adapter";

const schema = defineFlagSchema({
  subscriptionUiVersion: { decoder: "number", defaultValue: 6 },
});

const TIER_BY_OFFSET = ["tier1", "tier2", "tier3"] as const;
const defineAppExperiment = defineExperiment<typeof schema>();

const subscriptionExperiment = defineAppExperiment({
  decode: (raw) => TIER_BY_OFFSET[(raw - 6) % 3] ?? "tier1",
  defaultVariant: "tier1",
  key: "subscriptionUiVersion",
  variants: TIER_BY_OFFSET,
});

describe("resolveExperiment", () => {
  it("decodes the raw flag value into a variant via one decode function", () => {
    const engine = createFlagsEngine({
      adapter: createTestAdapter({
        subscriptionUiVersion: { raw: "8", source: "remote" },
      }),
      schema,
    });

    expect(resolveExperiment(engine, subscriptionExperiment)).toBe("tier3");
  });

  it("falls back to defaultVariant when decode returns something outside variants", () => {
    const rogueExperiment = defineAppExperiment({
      decode: () => "not-a-real-variant" as "tier1",
      defaultVariant: "tier1",
      key: "subscriptionUiVersion",
      variants: TIER_BY_OFFSET,
    });
    const engine = createFlagsEngine({
      adapter: createTestAdapter({
        subscriptionUiVersion: { raw: "8", source: "remote" },
      }),
      schema,
    });

    expect(resolveExperiment(engine, rogueExperiment)).toBe("tier1");
  });

  it("uses the schema default (and thus defaultVariant's tier) before init", () => {
    const engine = createFlagsEngine({
      adapter: createTestAdapter({}),
      schema,
    });

    // default raw value is 6 -> offset 0 -> "tier1"
    expect(resolveExperiment(engine, subscriptionExperiment)).toBe("tier1");
  });
});
