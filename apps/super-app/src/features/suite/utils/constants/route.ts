import type { SuiteTool, SuiteToolRoutes } from "@/features/suite/types/routes";

const SUITE_CREATIVE_STUDIO_ROOT = "/design-studio";
const GUEST_SUITE_CREATIVE_STUDIO_ROOT = `/guest${SUITE_CREATIVE_STUDIO_ROOT}`;

// A "tool" here is a top-level studio surface (its own route root), NOT a use-case chip. `design` =
// the Design Studio (`/design-studio`, holds use-cases logo/post/flyer…); `video` = the Video Studio.
export const SUITE_TOOL = {
  DESIGN: "design",
  VIDEO: "video",
} as const satisfies Record<string, SuiteTool>;

// Design-studio use-case slugs (the `<slug>` in /design-studio/<slug>). Declared as plain strings here
// so non-JSX consumers — notably the auth middleware on the edge runtime — can reason about slugs
// without importing the JSX use-case config (studio-usecases.tsx, which pulls SVG components).
// STUDIO_USECASES builds its `slug` fields from these values, so this stays the single source.
export const DESIGN_STUDIO_USECASE_SLUG = {
  LOGO: "logo",
} as const;

// Flat list form for membership checks (e.g. "is this path segment a use-case slug?").
export const DESIGN_STUDIO_USECASE_SLUGS: readonly string[] = Object.values(
  DESIGN_STUDIO_USECASE_SLUG
);

const SUITE_VIEW_ALL_PROJECT_SEGMENT = "view-all-project";

const getSuiteToolPath = (
  _tool: SuiteTool,
  root = SUITE_CREATIVE_STUDIO_ROOT
) =>
  // All suite tools currently share the /design-studio base (no per-tool segment). `_tool` is kept
  // in the signature — and every caller (HOME/DETAIL/VIEW_ALL) already passes its real tool — so
  // expanding to per-tool paths later is a single change HERE: `${root}/${_tool}`.
  root;

const getSuiteToolDetailPath = (
  tool: SuiteTool,
  id: string,
  root = SUITE_CREATIVE_STUDIO_ROOT
) => `${getSuiteToolPath(tool, root)}/${id}`;

const getSuiteToolViewAllPath = (
  tool: SuiteTool,
  root = SUITE_CREATIVE_STUDIO_ROOT
) => `${getSuiteToolPath(tool, root)}/${SUITE_VIEW_ALL_PROJECT_SEGMENT}`;

export const SUITE_TOOL_ROUTES = {
  [SUITE_TOOL.DESIGN]: {
    DETAIL: (id: string) => getSuiteToolDetailPath(SUITE_TOOL.DESIGN, id),
    HOME: getSuiteToolPath(SUITE_TOOL.DESIGN),
    VIEW_ALL: getSuiteToolViewAllPath(SUITE_TOOL.DESIGN),
  },
  [SUITE_TOOL.VIDEO]: {
    DETAIL: (id: string) => getSuiteToolDetailPath(SUITE_TOOL.VIDEO, id),
    HOME: getSuiteToolPath(SUITE_TOOL.VIDEO),
    VIEW_ALL: getSuiteToolViewAllPath(SUITE_TOOL.VIDEO),
  },
} as const satisfies Record<Exclude<SuiteTool, "">, SuiteToolRoutes>;

export const GUEST_SUITE_TOOL_ROUTES = {
  [SUITE_TOOL.DESIGN]: {
    DETAIL: (id: string) =>
      getSuiteToolDetailPath(
        SUITE_TOOL.DESIGN,
        id,
        GUEST_SUITE_CREATIVE_STUDIO_ROOT
      ),
    HOME: getSuiteToolPath(SUITE_TOOL.DESIGN, GUEST_SUITE_CREATIVE_STUDIO_ROOT),
    VIEW_ALL: getSuiteToolViewAllPath(
      SUITE_TOOL.DESIGN,
      GUEST_SUITE_CREATIVE_STUDIO_ROOT
    ),
  },
  [SUITE_TOOL.VIDEO]: {
    DETAIL: (id: string) =>
      getSuiteToolDetailPath(
        SUITE_TOOL.VIDEO,
        id,
        GUEST_SUITE_CREATIVE_STUDIO_ROOT
      ),
    HOME: getSuiteToolPath(SUITE_TOOL.VIDEO, GUEST_SUITE_CREATIVE_STUDIO_ROOT),
    VIEW_ALL: getSuiteToolViewAllPath(
      SUITE_TOOL.VIDEO,
      GUEST_SUITE_CREATIVE_STUDIO_ROOT
    ),
  },
} as const satisfies Record<Exclude<SuiteTool, "">, SuiteToolRoutes>;

// const SUITE_DESIGN_ROUTES = SUITE_TOOL_ROUTES.design;

export type SuiteBackBehavior = "studio-root" | "return-to-origin";

// Demo toggle (single source). Decide after demoing both, then change this one line.
//   "studio-root"      → back always returns to the studio root (e.g. /design-studio)
//   "return-to-origin" → back returns to where you came from (the use-case home / previous entry)
// `as SuiteBackBehavior` keeps the union type so same-file comparisons aren't narrowed to the literal.
export const SUITE_BACK_BEHAVIOR = "studio-root" as SuiteBackBehavior;

// Base URL a Kind-2 detail "back" returns to when the detail was entered from a use-case home
// (/design-studio/<slug>). Kind-2 back uses pushState(string), so this is a plain path, not router.back.
export const resolveStudioBackBase = (
  routes: SuiteToolRoutes,
  originUsecaseSlug?: string
): string =>
  SUITE_BACK_BEHAVIOR === "return-to-origin" && originUsecaseSlug
    ? `${routes.HOME}/${originUsecaseSlug}`
    : routes.HOME;
