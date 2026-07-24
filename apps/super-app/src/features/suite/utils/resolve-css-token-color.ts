/**
 * Resolve a v2 design-token CSS variable (e.g. "--color-v1-surface-glass-dark-breath") to a literal
 * color string for use on a <canvas> (Konva), which cannot read CSS variables or Tailwind classes.
 *
 * getComputedStyle on the custom property itself returns the unresolved `var(...)` chain, so we assign
 * it to a real `color` property on a throwaway element and read the browser-resolved `rgba()` back.
 * Synchronous — call it during render (useMemo), NOT in an effect, so the first canvas paint already
 * has the right color and there is no flash/jank. Returns `fallback` during SSR (no document).
 */
export function resolveCssTokenColor(
  cssVarName: string,
  fallback: string
): string {
  if (typeof document === "undefined") {
    return fallback;
  }
  const probe = document.createElement("span");
  probe.style.color = `var(${cssVarName})`;
  probe.style.display = "none";
  document.body.append(probe);
  const resolved = getComputedStyle(probe).color;
  probe.remove();
  return resolved || fallback;
}
