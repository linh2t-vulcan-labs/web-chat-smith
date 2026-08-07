"use client";

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

const Collapsible = ({ ...props }: CollapsiblePrimitive.Root.Props) => (
  <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
);

const CollapsibleTrigger = ({
  ...props
}: CollapsiblePrimitive.Trigger.Props) => (
  <CollapsiblePrimitive.Trigger data-slot="collapsible-trigger" {...props} />
);

// Height-only collapse (see the shared `[data-slot="collapsible-content"]`
// transition in globals.css). No accompanying fade/slide: sibling content
// below the panel needs the panel's own box to actually shrink to look
// smooth when it closes, which only a height animation gives — a fade/slide
// alone leaves the panel at full height until the instant it unmounts, so
// everything below it snaps up abruptly. Combining fade/slide with the
// height transition on this same element was tried and reverted: Base UI
// warns against two animation types on one element, and it wasn't behind
// the actual re-render cost anyway (that's inherent to interpolating the
// measured height value itself, not to how many animated properties ride
// along with it) — one property keeps this the simplest version that still
// looks right.
const CollapsibleContent = ({ ...props }: CollapsiblePrimitive.Panel.Props) => (
  <CollapsiblePrimitive.Panel data-slot="collapsible-content" {...props} />
);

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
