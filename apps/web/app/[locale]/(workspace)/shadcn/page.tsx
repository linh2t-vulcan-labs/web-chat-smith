/* oxlint-disable cs-seo/no-raw-next-metadata-on-marketing-page cs-seo/require-json-ld-on-public-page cs-seo/require-single-h1 cs-seo/prefer-main-landmark -- manual component QA route */
import type { Metadata } from "next";

import { ShadcnGallery } from "@/components/shadcn";

export const metadata: Metadata = {
  description: "Manual QA gallery for @cs/ui components.",
  title: "@cs/ui examples",
};

export default function ShadcnUIPage() {
  return <ShadcnGallery />;
}
