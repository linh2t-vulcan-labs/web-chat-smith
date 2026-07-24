// Per-component barrel: safe for tree-shaking since each component is its own
// exports subpath. Don't add a root src/index.ts re-exporting every component.
export * from "./button";
