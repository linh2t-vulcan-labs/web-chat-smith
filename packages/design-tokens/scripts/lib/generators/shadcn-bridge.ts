const TOKEN_VAR_MAP = {
  accent: "--cs-surface-overlay-interactive-hover",
  "accent-foreground": "--cs-text-hierarchy-primary",
  background: "--cs-surface-hierarchy-base",
  border: "--cs-border-structural-default",
  card: "--cs-surface-hierarchy-raised",
  "card-foreground": "--cs-text-hierarchy-primary",
  "chart-1": "--cs-color-brand-500",
  "chart-2": "--cs-color-hue-teal-600",
  "chart-3": "--cs-color-hue-blue-700",
  "chart-4": "--cs-color-hue-amber-600",
  "chart-5": "--cs-color-hue-purple-600",
  destructive: "--cs-action-background-destructive",
  "destructive-foreground": "--cs-action-text-destructive",
  foreground: "--cs-text-hierarchy-primary",
  input: "--cs-border-structural-default",
  muted: "--cs-surface-hierarchy-container",
  "muted-foreground": "--cs-text-hierarchy-secondary",
  popover: "--cs-surface-hierarchy-raised",
  "popover-foreground": "--cs-text-hierarchy-primary",
  primary: "--cs-action-background-primary",
  "primary-foreground": "--cs-action-text-primary",
  radius: "--cs-radius-standard",
  ring: "--cs-border-interactive-focus",
  secondary: "--cs-action-background-secondary",
  "secondary-foreground": "--cs-action-text-secondary",
  sidebar: "--cs-surface-hierarchy-raised",
  "sidebar-accent": "--cs-surface-overlay-interactive-hover",
  "sidebar-accent-foreground": "--cs-text-hierarchy-primary",
  "sidebar-border": "--cs-border-structural-default",
  "sidebar-foreground": "--cs-text-hierarchy-primary",
  "sidebar-primary": "--cs-action-background-primary",
  "sidebar-primary-foreground": "--cs-action-text-primary",
  "sidebar-ring": "--cs-border-interactive-focus",
} as const;

/**
 * Bridges design-token variables to the shadcn/Tailwind v4 variable names
 * (--background, --primary, ...). Consumers (e.g. the @cs/ui globals.css
 * entrypoint) own the tailwindcss import, dark variant, inline theme and
 * base layer — this file only emits the :root variable assignments.
 *
 * There is no separate `.dark` block here: tokens.css ships a `.dark` rule
 * that overrides every `--cs-*` variable with its real value from
 * `alias_colors Dark.json` (see generateDarkModeCss). Because every shadcn
 * variable above is defined as `var(--cs-*)`, it automatically resolves to
 * the correct dark value through the CSS custom-property cascade once an
 * ancestor has the `.dark` class — no duplicated dark mapping to maintain
 * or keep in sync.
 */
export const generateShadcnBridgeCss = (): string => {
  const lines = [
    ":root {",
    ...Object.entries(TOKEN_VAR_MAP).map(
      ([name, tokenVar]) => `  --${name}: var(${tokenVar});`
    ),
    "}",
  ];

  return `${lines.join("\n")}\n`;
};
