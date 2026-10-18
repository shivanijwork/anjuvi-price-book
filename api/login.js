import { checkPassword, sessionCookie, clearCookie } from "./_lib/auth.js";

export default function handler(req, res) {
  if (req.method === "DELETE") {
    res.setHeader("Set-Cookie", clearCookie());
    return res.status(200).json({ ok: true });
  }
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  const password = req.body?.password;
  if (!checkPassword(password)) return res.status(401).json({ error: "wrong_password" });

  res.setHeader("Set-Cookie", sessionCookie());
  return res.status(200).json({ ok: true });
}
