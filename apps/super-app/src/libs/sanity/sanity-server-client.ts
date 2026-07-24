import { env } from "@cs/env";
import type { SanityClient } from "next-sanity";
import { createClient } from "next-sanity";

let sanityServerClient: SanityClient | null = null;

export function getSanityServerClient(): SanityClient {
  if (sanityServerClient) {
    return sanityServerClient;
  }

  if (
    !env.SANITY_PROJECT_ID ||
    !env.SANITY_DATASET ||
    !env.SANITY_API_VERSION
  ) {
    throw new Error(
      "Missing Sanity environment variables. Check your .env.local file."
    );
  }

  sanityServerClient = createClient({
    apiVersion: env.SANITY_API_VERSION ?? "vX",
    dataset: env.SANITY_DATASET ?? "",
    projectId: env.SANITY_PROJECT_ID ?? "",
    token: env.SANITY_API_TOKEN ?? "",
    useCdn: !!env.SANITY_USE_CDN,
  });

  return sanityServerClient;
}
