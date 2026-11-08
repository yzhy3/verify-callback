import crypto from 'node:crypto';

const SECRET = process.env.SESSION_SECRET;

function sign(body) {
  return crypto.createHmac('sha256', SECRET).update(body).digest('base64url');
}

export function signPayload(payload, ttlMs = 10 * 60_000) {
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + ttlMs })).toString('base64url');
  return `${body}.${sign(body)}`;
}

export function verifyPayload(token) {
  if (!token) return null;
  const [body, mac] = String(token).split('.');
  if (!body || !mac) return null;

  const expected = sign(body);
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  let data;
  try {
    data = JSON.parse(Buffer.from(body, 'base64url').toString());
  } catch {
    return null;
  }

  if (!data.exp || data.exp < Date.now()) return null;
  return data;
}