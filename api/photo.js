import { Readable } from "node:stream";
import { get } from "@vercel/blob";
import { requireLogin } from "./_lib/auth.js";
import { blobToken, isValidPathname } from "./_lib/blob.js";

// Streams a photo from the private Blob store. Only logged-in viewers can see photos.
export default async function handler(req, res) {
  if (!requireLogin(req, res)) return;
  const p = req.query.p;
  if (!isValidPathname(p)) return res.status(400).json({ error: "bad_path" });

  try {
    const result = await get(p, { access: "private", token: blobToken() });
    if (!result || !result.stream) return res.status(404).json({ error: "not_found" });

    res.setHeader("Content-Type", result.blob.contentType || "image/jpeg");
    // File names carry a random suffix and never change, so the phone can keep them.
    res.setHeader("Cache-Control", "private, max-age=31536000, immutable");
    res.status(200);
    Readable.fromWeb(result.stream).pipe(res);
  } catch (e) {
    console.error("photo failed:", e);
    res.status(500).json({ error: "photo_failed" });
  }
}
