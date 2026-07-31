import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// `test.globals` is off (explicit imports over implicit globals, per this
// repo's style) — @testing-library/react's own auto-cleanup only registers
// when it finds `afterEach` on globalThis, so without `globals: true` it
// never fires and unmounted trees pile up across tests in the same file.
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement matchMedia — @cs/themes' ThemeProvider reads it
// synchronously on mount to resolve the "system" theme, so anything that
// renders ThemeProvider in a test needs this stub.
const noop = () => {
  // no-op: nothing in this test environment listens for media-query changes.
};

Object.defineProperty(window, "matchMedia", {
  value: (query: string) => ({
    addEventListener: noop,
    addListener: noop,
    dispatchEvent: () => false,
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: noop,
    removeListener: noop,
  }),
  writable: true,
});
