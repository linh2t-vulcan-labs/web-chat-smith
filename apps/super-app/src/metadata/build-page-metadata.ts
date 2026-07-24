import type { Metadata } from "next";

import { buildPageAlternates, withPageAlternates } from "./alternates";
import type { PageAlternatesInput } from "./alternates";

export interface BasicPageMetadataInput {
  title: string;
  description?: string;
  keywords?: string;
  alternates: PageAlternatesInput;
}

/** Builds Next.js metadata with title, description, and canonical/hreflang alternates. */
export function buildBasicPageMetadata({
  title,
  description,
  keywords,
  alternates,
}: BasicPageMetadataInput): Metadata {
  const metadata: Metadata = {
    title,
    ...(description ? { description } : {}),
    ...(keywords ? { keywords } : {}),
  };

  return withPageAlternates(metadata, buildPageAlternates(alternates));
}
