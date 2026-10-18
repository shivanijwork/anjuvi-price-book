import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE = "anjuvi_session";

// The session token is derived from APP_PASSWORD, so changing the password logs everyone out.
function expectedToken() {
  const pw = process.env.APP_PASSWORD;
  if (!pw) throw new Error("APP_PASSWORD is not set");
  return createHmac("sha256", pw).update("anjuvi-session-v1").digest("hex");
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && timingSafeEqual(x, y);
}

export function checkPassword(pw) {
  return safeEqual(pw || "", process.env.APP_PASSWORD || "\0");
}

export function sessionCookie() {
  const oneYear = 60 * 60 * 24 * 365;
  return `${COOKIE}=${expectedToken()}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${oneYear}`;
}

export function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export function isLoggedIn(req) {
  const raw = req.headers.cookie || "";
  const m = raw.split(/;\s*/).find(c => c.startsWith(COOKIE + "="));
  if (!m) return false;
  return safeEqual(m.slice(COOKIE.length + 1), expectedToken());
}

// Returns true if the request may continue; otherwise sends 401.
export function requireLogin(req, res) {
  if (isLoggedIn(req)) return true;
  res.status(401).json({ error: "login_required" });
  return false;
}
