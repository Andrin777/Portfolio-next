import { client } from "./client";

/**
 * Fetch from Sanity but never crash the build/render: if the backend is
 * unreachable or not configured yet, log a warning and return `fallback`.
 * This lets the site build and run before any content has been imported.
 */
export async function sanityFetch<T>(
  query: string,
  fallback: T,
  params: Record<string, unknown> = {},
): Promise<T> {
  try {
    return await client.fetch<T>(query, params);
  } catch (err) {
    console.warn(
      "[sanity] fetch failed, using fallback:",
      err instanceof Error ? err.message : err,
    );
    return fallback;
  }
}
