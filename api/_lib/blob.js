// Vercel names the token BLOB_READ_WRITE_TOKEN by default, or <PREFIX>_READ_WRITE_TOKEN
// if a custom prefix was chosen when the Blob store was connected.
export function blobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  const key = Object.keys(process.env).find(k => k.endsWith("_READ_WRITE_TOKEN"));
  return key ? process.env[key] : undefined;
}

// The store is private, so photos are served through /api/photo (login required).
export const PHOTO_PREFIX = "suits/";

export function photoUrlFor(pathname) {
  return "/api/photo?p=" + encodeURIComponent(pathname);
}

export function isValidPathname(p) {
  return typeof p === "string" && p.startsWith(PHOTO_PREFIX) && /^[A-Za-z0-9/_.-]+$/.test(p) && !p.includes("..");
}
