import { neon } from "@neondatabase/serverless";
import { requireLogin } from "./_lib/auth.js";

const sql = neon(process.env.DATABASE_URL);

function toInt(v, { required = false } = {}) {
  if (v === null || v === undefined || v === "") {
    if (required) throw new Error("missing");
    return null;
  }
  const n = Math.round(Number(v));
  if (!Number.isFinite(n) || n < 0) throw new Error("bad_number");
  return n;
}

function cleanPhoto(url) {
  if (url == null || url === "") return null;
  const s = String(url);
  // Only our own photos folder or Vercel Blob URLs are allowed.
  if (s.startsWith("/photos/") || /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(s)) return s;
  throw new Error("bad_photo");
}

export default async function handler(req, res) {
  if (!requireLogin(req, res)) return;

  try {
    if (req.method === "GET") {
      const rows = await sql`select id, num, name, cp, sp, online_sp, online_cost, photo_url, sold, updated_at from suits order by num`;
      return res.status(200).json({ suits: rows });
    }

    const body = req.body || {};

    if (req.method === "POST") {
      const cp = toInt(body.cp, { required: true });
      const sp = toInt(body.sp, { required: true });
      const rows = await sql`
        insert into suits (num, name, cp, sp, online_sp, online_cost, photo_url)
        values ((select coalesce(max(num), 0) + 1 from suits),
                ${String(body.name || "").slice(0, 120)}, ${cp}, ${sp},
                ${toInt(body.online_sp)}, ${toInt(body.online_cost)}, ${cleanPhoto(body.photo_url)})
        returning id, num, name, cp, sp, online_sp, online_cost, photo_url, sold, updated_at`;
      return res.status(201).json({ suit: rows[0] });
    }

    const id = toInt(req.query.id, { required: true });

    if (req.method === "PATCH") {
      const cur = (await sql`select * from suits where id = ${id}`)[0];
      if (!cur) return res.status(404).json({ error: "not_found" });
      const has = k => Object.prototype.hasOwnProperty.call(body, k);
      const next = {
        name: has("name") ? String(body.name || "").slice(0, 120) : cur.name,
        cp: has("cp") ? toInt(body.cp, { required: true }) : cur.cp,
        sp: has("sp") ? toInt(body.sp, { required: true }) : cur.sp,
        online_sp: has("online_sp") ? toInt(body.online_sp) : cur.online_sp,
        online_cost: has("online_cost") ? toInt(body.online_cost) : cur.online_cost,
        photo_url: has("photo_url") ? cleanPhoto(body.photo_url) : cur.photo_url,
        sold: has("sold") ? Boolean(body.sold) : cur.sold,
      };
      const rows = await sql`
        update suits set name = ${next.name}, cp = ${next.cp}, sp = ${next.sp},
          online_sp = ${next.online_sp}, online_cost = ${next.online_cost},
          photo_url = ${next.photo_url}, sold = ${next.sold}, updated_at = now()
        where id = ${id}
        returning id, num, name, cp, sp, online_sp, online_cost, photo_url, sold, updated_at`;
      return res.status(200).json({ suit: rows[0] });
    }

    if (req.method === "DELETE") {
      await sql`delete from suits where id = ${id}`;
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "method_not_allowed" });
  } catch (e) {
    if (["missing", "bad_number", "bad_photo"].includes(e.message)) {
      return res.status(400).json({ error: e.message });
    }
    console.error("suits failed:", e);
    return res.status(500).json({
      error: process.env.DATABASE_URL ? "db_error" : "db_not_configured",
      detail: String(e && e.message || e).slice(0, 300),
    });
  }
}
