import { put } from "@vercel/blob";
import { requireLogin } from "./_lib/auth.js";
import { blobToken, photoUrlFor, PHOTO_PREFIX } from "./_lib/blob.js";

// The page shrinks photos to ~1200px JPEG before sending, so the body stays well under Vercel's 4.5 MB limit.
export default async function handler(req, res) {
  if (!requireLogin(req, res)) return;
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  try {
    const data = req.body?.data;
    if (typeof data !== "string" || !data) return res.status(400).json({ error: "no_photo" });
    const buf = Buffer.from(data, "base64");
    if (buf.length > 3.5 * 1024 * 1024) return res.status(413).json({ error: "too_large" });
    // JPEG files start with FF D8.
    if (buf[0] !== 0xff || buf[1] !== 0xd8) return res.status(400).json({ error: "not_jpeg" });

    const blob = await put(`${PHOTO_PREFIX}suit-${Date.now()}.jpg`, buf, {
      access: "private",
      contentType: "image/jpeg",
      addRandomSuffix: true,
      token: blobToken(),
    });
    return res.status(200).json({ url: photoUrlFor(blob.pathname) });
  } catch (e) {
    console.error("upload failed:", e);
    return res.status(500).json({
      error: blobToken() ? "upload_failed" : "blob_not_connected",
      detail: String(e && e.message || e).slice(0, 300),
    });
  }
}
