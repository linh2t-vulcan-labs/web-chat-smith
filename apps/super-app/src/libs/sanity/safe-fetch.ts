"use server";

import type { QueryParams } from "next-sanity";

import { getSanityServerClient } from "./sanity-server-client";

interface SanityFetchOptions {
  /**
   * Cache configuration for Next.js
   */
  cache?: RequestCache;
  /**
   * Next.js revalidation settings
   */
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

interface SafeFetchResult<T> {
  data: T | null;
  error: Error | null;
}

/**
 * Safely fetch data from Sanity CMS with error handling
 * Returns a tuple of [data, error] to avoid throwing errors that could crash the app
 *
 * @param query - GROQ query string
 * @param params - Query parameters
 * @param options - Fetch options (cache, revalidation)
 * @param fallback - Optional fallback value to return on error
 * @returns Object containing data and error
 *
 * @example
 * ```ts
 * const { data, error } = await safeSanityFetch<TBlog>(
 *   LATEST_BLOG_QUERY,
 *   {},
 *   { cache: "no-store" }
 * );
 *
 * if (error) {
 *   console.error("Failed to fetch blog:", error);
 *   return <ErrorFallback />;
 * }
 *
 * return <BlogView data={data} />;
 * ```
 */
export async function safeSanityFetch<T = unknown>(
  query: string,
  params: QueryParams = {},
  options: SanityFetchOptions = {},
  fallback?: T
): Promise<SafeFetchResult<T>> {
  try {
    // Try to get Sanity client
    const client = await getSanityServerClient();

    // Fetch data from Sanity
    const data = await client.fetch<T>(query, params, options);

    // If data is null or undefined, use fallback if provided
    if ((data === null || data === undefined) && fallback !== undefined) {
      return { data: fallback, error: null };
    }

    return { data, error: null };
  } catch (error) {
    // Log error for debugging
    console.error("[Sanity Fetch Error]", {
      error: error instanceof Error ? error.message : String(error),
      params,
      query: query.slice(0, 100), // Log first 100 chars of query,
    });

    // Return fallback or null with error
    return {
      data: fallback ?? null,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Safely fetch data from Sanity CMS with error handling (alternative signature)
 * Throws an error if data cannot be fetched and no fallback is provided
 *
 * @param query - GROQ query string
 * @param fallback - Fallback value to return on error (required)
 * @param params - Query parameters
 * @param options - Fetch options (cache, revalidation)
 * @returns The fetched data or fallback value
 *
 * @example
 * ```ts
 * const blogs = await safeSanityFetchWithFallback<TBlog[]>(
 *   LATEST_BLOGS_QUERY,
 *   [], // Return empty array on error
 *   {},
 *   { next: { revalidate: 3600 } }
 * );
 *
 * return <BlogList blogs={blogs} />;
 * ```
 */
export async function safeSanityFetchWithFallback<T = unknown>(
  query: string,
  fallback: T,
  params: QueryParams = {},
  options: SanityFetchOptions = {}
): Promise<T> {
  const { data, error } = await safeSanityFetch<T>(
    query,
    params,
    options,
    fallback
  );

  if (error) {
    console.warn("[Sanity] Using fallback value due to fetch error");
  }

  return data ?? fallback;
}
