/** Only allow deletion of files stored in our own Blob store paths. */
export function isManagedBlobUrl(url: unknown): url is string {
  if (typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" &&
      /^[a-z0-9-]+\.public\.blob\.vercel-storage\.com$/i.test(parsed.hostname) &&
      /^\/(?:avatars|markers)\//.test(parsed.pathname);
  } catch { return false; }
}
