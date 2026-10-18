import { put } from "@vercel/blob";
import { requireLogin } from "./_lib/auth.js";

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

    const blob = await put(`suits/suit-${Date.now()}.jpg`, buf, {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: true,
    });
    return res.status(200).json({ url: blob.url });
  } catch (e) {
    console.error("upload failed:", e);
    const noToken = !process.env.BLOB_READ_WRITE_TOKEN;
    return res.status(500).json({
      error: noToken ? "blob_not_connected" : "upload_failed",
      detail: String(e && e.message || e).slice(0, 300),
    });
  }
}
