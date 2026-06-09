/**
 * Append Sanity CDN transform params to an image URL.
 * Works on the `asset->url` strings returned by our GROQ queries.
 */
export function imgUrl(
  url: string | undefined | null,
  width?: number,
  height?: number,
): string {
  if (!url) return "";
  const params = new URLSearchParams({ auto: "format", fit: "max", q: "82" });
  if (width) params.set("w", String(width));
  if (height) params.set("h", String(height));
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${params.toString()}`;
}
