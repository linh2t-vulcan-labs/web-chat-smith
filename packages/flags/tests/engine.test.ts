import { describe, expect, it, vi } from "vitest";

import { createFlagsEngine } from "../src/core/engine";
import { defineFlagSchema } from "../src/schema";
import { createTestAdapter } from "./test-adapter";

const testGovernance = {
  expiresAt: "2999-01-01",
  owner: "test",
  type: "release",
} as const;

const schema = defineFlagSchema({
  syncBeta: {
    decoder: "boolean",
    defaultValue: false,
    governance: testGovernance,
  },
  uiVersion: { decoder: "number", defaultValue: 3, governance: testGovernance },
  webFeatures: {
    decoder: "json",
    defaultValue: {} as Record<string, unknown>,
    governance: testGovernance,
  },
  welcomeLabel: {
    decoder: "string",
    defaultValue: "hi",
    governance: testGovernance,
  },
});

describe("createFlagsEngine", () => {
  it("decodes each key via its schema decoder, not a shared typeof check", () => {
    const engine = createFlagsEngine({
      adapter: createTestAdapter({
        syncBeta: { raw: "true", source: "remote" },
        uiVersion: { raw: "7", source: "remote" },
        webFeatures: { raw: '{"a":1}', source: "remote" },
        welcomeLabel: { raw: "hello", source: "remote" },
      }),
      schema,
    });

    expect(engine.getValue("syncBeta")).toBe(true);
    expect(engine.getValue("uiVersion")).toBe(7);
    expect(engine.getValue("webFeatures")).toEqual({ a: 1 });
    expect(engine.getValue("welcomeLabel")).toBe("hello");
  });

  it("falls back to the schema default when the source is static", () => {
    const engine = createFlagsEngine({
      adapter: createTestAdapter({}),
      schema,
    });

    expect(engine.getValue("syncBeta")).toBe(false);
    expect(engine.getValue("uiVersion")).toBe(3);
    expect(engine.getValue("welcomeLabel")).toBe("hi");
  });

  it("reports and falls back to default when the adapter throws", () => {
    const onError = vi.fn();
    const engine = createFlagsEngine({
      adapter: createTestAdapter({}, { failKeys: ["uiVersion"] }),
      onError,
      schema,
    });

    expect(engine.getValue("uiVersion")).toBe(3);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ key: "uiVersion", phase: "get" })
    );
  });

  it("local overrides win over remote values and defaults", () => {
    const engine = createFlagsEngine({
      adapter: createTestAdapter({
        syncBeta: { raw: "true", source: "remote" },
      }),
      initialOverrides: { syncBeta: false },
      schema,
    });

    expect(engine.getValue("syncBeta")).toBe(false);
  });

  it("setOverride/clearOverrides update reads and notify subscribers", () => {
    const engine = createFlagsEngine({
      adapter: createTestAdapter({}),
      schema,
    });
    const listener = vi.fn();
    engine.subscribe(listener);

    engine.setOverride("uiVersion", 42);
    expect(engine.getValue("uiVersion")).toBe(42);
    expect(listener).toHaveBeenCalledTimes(1);

    engine.clearOverrides();
    expect(engine.getValue("uiVersion")).toBe(3);
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("marks initialized and notifies even when init() fails", async () => {
    const onError = vi.fn();
    const listener = vi.fn();
    const engine = createFlagsEngine({
      adapter: createTestAdapter({}, { failInit: true }),
      onError,
      schema,
    });
    engine.subscribe(listener);

    expect(engine.initialized).toBe(false);
    await engine.init();

    expect(engine.initialized).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ phase: "init" })
    );
  });
});
