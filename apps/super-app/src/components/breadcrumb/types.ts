import type { ReactNode } from "react";

export interface TBreadCrumbProps {
  separator: ReactNode;
  containerClasses?: string;
  listClasses?: string;
  activeClasses?: string;
  capitalizeLinks?: boolean;
  firstSegmentLabelMap?: Record<string, string>;
  /** Overrides display text for URL path segments (e.g. localized FAQ titles). Key = segment as in pathname. */
  segmentLabelMap?: Record<string, string>;
}
