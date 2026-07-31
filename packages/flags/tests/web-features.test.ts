import { describe, expect, it } from "vitest";

import { createFlagsEngine } from "../src/core/engine";
import { defineFlagSchema } from "../src/schema";
import { createWebFeatures } from "../src/web-features";
import { createTestAdapter } from "./test-adapter";

const schema = defineFlagSchema({
  webFeatures: {
    decoder: "json",
    defaultValue: {} as Record<string, unknown>,
    governance: { owner: "test", type: "config" },
  },
});

describe("createWebFeatures", () => {
  it("reads a boolean-shaped nested feature", () => {
    const engine = createFlagsEngine({
      adapter: createTestAdapter({
        webFeatures: { raw: '{"signInOneTap":true}', source: "remote" },
      }),
      schema,
    });
    const { isWebFeatureEnabled } = createWebFeatures(engine, "webFeatures");

    expect(isWebFeatureEnabled("signInOneTap")).toBe(true);
  });

  it("reads an object-shaped nested feature (isEnabled)", () => {
    const engine = createFlagsEngine({
      adapter: createTestAdapter({
        webFeatures: {
          raw: '{"syncHistory":{"isEnabled":true,"description":"x"}}',
          source: "remote",
        },
      }),
      schema,
    });
    const { isWebFeatureEnabled, getWebFeature } = createWebFeatures(
      engine,
      "webFeatures"
    );

    expect(isWebFeatureEnabled("syncHistory")).toBe(true);
    expect(getWebFeature("syncHistory")).toEqual({
      description: "x",
      isEnabled: true,
    });
  });

  it("returns false/null for a missing feature", () => {
    const engine = createFlagsEngine({
      adapter: createTestAdapter({
        webFeatures: { raw: "{}", source: "remote" },
      }),
      schema,
    });
    const { isWebFeatureEnabled, getWebFeature } = createWebFeatures(
      engine,
      "webFeatures"
    );

    expect(isWebFeatureEnabled("featureFaq")).toBe(false);
    expect(getWebFeature("featureFaq")).toBeNull();
  });
});
