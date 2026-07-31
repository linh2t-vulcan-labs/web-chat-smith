import { createFlagsEngine } from "@cs/flags";
import { REMOTE_CONFIG_KEYS } from "@cs/flags/keys";
import { createTestAdapter } from "@cs/flags/testing";
import { ThemeProvider } from "@cs/themes";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { flagSchema } from "@/lib/flags";
import { FlagsProvider } from "@/lib/flags-react";

import { ThemeToggleGated } from "./theme-toggle-gated";

/**
 * `createTestAdapter` (from `@cs/flags/testing`) is the same fake adapter
 * `@cs/flags`'s own engine tests use — no real Remote Config/Firebase touched.
 * `raw` mirrors what Remote Config would hand back as a string; `undefined`
 * simulates "no adapter value yet" (falls through to the schema default).
 */
const renderGated = (raw?: string) => {
  const engine = createFlagsEngine({
    adapter: createTestAdapter(
      raw === undefined
        ? {}
        : {
            [REMOTE_CONFIG_KEYS.ENABLE_THEME_TOGGLE]: { raw, source: "remote" },
          }
    ),
    schema: flagSchema,
  });

  return render(
    <ThemeProvider>
      <FlagsProvider engine={engine}>
        <ThemeToggleGated />
      </FlagsProvider>
    </ThemeProvider>
  );
};

describe("ThemeToggleGated", () => {
  it("renders the toggle when the flag hasn't resolved yet (schema default is true)", () => {
    renderGated();
    expect(
      screen.getByRole("button", { name: "Toggle theme" })
    ).toBeInTheDocument();
  });

  it("renders the toggle when Remote Config resolves the flag to true", () => {
    renderGated("true");
    expect(
      screen.getByRole("button", { name: "Toggle theme" })
    ).toBeInTheDocument();
  });

  it("hides the toggle when Remote Config resolves the flag to false", () => {
    renderGated("false");
    expect(
      screen.queryByRole("button", { name: "Toggle theme" })
    ).not.toBeInTheDocument();
  });
});
