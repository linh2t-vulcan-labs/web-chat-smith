import path from "node:path";

import { createElement } from "react";
import type { FunctionComponent } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { toComponentName } from "./naming";

export type RenderResult =
  | { ok: true; markup: string }
  | { ok: false; reason: "missing" }
  | { ok: false; reason: "error"; message: string };

/** Imports the real generated component for `category/slug` (Bun transpiles
 * the `.tsx` on the fly) and server-renders it — the same thing a consumer
 * gets from `@cs/icons/<slug>`, not a re-read of the raw dump SVG. Returns
 * `{ ok: false, reason: "missing" }` when the file doesn't exist yet (e.g.
 * previewing a version before its first `bun run gen`) so callers can fall
 * back to the raw source instead of treating it as a pipeline bug. */
export const tryRenderGenerated = async (
  generatedVersionDir: string,
  category: string,
  slug: string
): Promise<RenderResult> => {
  const absPath = path.join(generatedVersionDir, category, `${slug}.tsx`);
  const file = Bun.file(absPath);
  if (!(await file.exists())) {
    return { ok: false, reason: "missing" };
  }

  const componentName = toComponentName(slug);
  try {
    const mod = (await import(absPath)) as Record<string, unknown>;
    const Component = mod[componentName];
    if (typeof Component !== "function") {
      return {
        message: `no export named ${componentName} (found: ${Object.keys(mod).join(", ") || "nothing"})`,
        ok: false,
        reason: "error",
      };
    }
    const markup = renderToStaticMarkup(
      createElement(Component as FunctionComponent<{ size: number }>, {
        size: 40,
      })
    );
    return { markup, ok: true };
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : String(error),
      ok: false,
      reason: "error",
    };
  }
};
