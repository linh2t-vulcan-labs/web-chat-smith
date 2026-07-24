export const generateRecipeCss = (): string =>
  [
    ".cs-button {",
    "  border-radius: var(--cs-radius-standard);",
    "  padding: var(--cs-spacing-structural-component-medium, 12px) var(--cs-spacing-structural-component-large, 16px);",
    "  border: 1px solid var(--cs-border-structural-default, transparent);",
    "  background: var(--cs-action-background-primary, transparent);",
    "  color: var(--cs-action-text-primary, currentColor);",
    "}",
    "",
    ".cs-input {",
    "  border-radius: var(--cs-radius-small);",
    "  padding: var(--cs-spacing-structural-component-small, 8px) var(--cs-spacing-structural-component-medium, 12px);",
    "  border: 1px solid var(--cs-border-structural-default, transparent);",
    "  background: var(--cs-form-background-chat, transparent);",
    "  color: var(--cs-form-text-default, currentColor);",
    "}",
    "",
  ].join("\n");
